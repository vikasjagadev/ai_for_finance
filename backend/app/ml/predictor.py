import datetime
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge

from app.ml.features import build_features
from app.ml.metrics import evaluate_predictions
from app.schemas.schemas import (
    PredictionRequest, PredictionResponse, ModelMetrics,
    HistoricalDataPoint, PredictedPoint
)
from app.services.market_data import STOCK_UNIVERSE

HORIZON_MAP = {
    "1d": 1,
    "7d": 7,
    "30d": 30
}

class StockPredictorEngine:

    @staticmethod
    def generate_prediction(req: PredictionRequest) -> PredictionResponse:
        clean_symbol = req.symbol.strip().upper()
        horizon_days = HORIZON_MAP.get(req.horizon.lower(), 7)

        # 1. Fetch historical OHLCV data
        ticker = yf.Ticker(clean_symbol)
        period = req.period if req.period in ["1y", "2y", "5y"] else "2y"
        df = ticker.history(period=period, interval="1d")

        if df.empty or len(df) < 100:
            # Try fetching broader historical period
            df = ticker.history(period="5y", interval="1d")
            if df.empty or len(df) < 60:
                raise ValueError(
                    f"Insufficient historical data available for {clean_symbol}. "
                    "At least 60 trading bars are required to train a valid predictive model."
                )

        current_price = round(float(df["Close"].iloc[-1]), 2)

        # 2. Extract features and target with strict lookahead prevention
        feature_df, feature_cols = build_features(df, horizon_days=horizon_days)

        # Drop NaNs resulting from rolling windows and forward shifts
        clean_df = feature_df.dropna(subset=feature_cols + ["target", "Close"]).copy()

        if len(clean_df) < 50:
            raise ValueError(
                f"Data sample after indicator initialization is too short ({len(clean_df)} bars). "
                "Please select a longer historical period (e.g. 2y or 5y)."
            )

        # 3. Chronological Train / Test Split (Strictly preserve temporal order)
        split_idx = int(len(clean_df) * 0.8)
        train_df = clean_df.iloc[:split_idx]
        test_df = clean_df.iloc[split_idx:]

        if len(test_df) < 10:
            split_idx = int(len(clean_df) * 0.75)
            train_df = clean_df.iloc[:split_idx]
            test_df = clean_df.iloc[split_idx:]

        X_train = train_df[feature_cols].values
        y_train = train_df["target"].values
        X_test = test_df[feature_cols].values
        y_test = test_df["target"].values

        # Naive baseline: price at time t assumes no change at t+h
        y_baseline_test = test_df["Close"].values
        y_prior_test = test_df["Close"].values

        # 4. Fit Feature Scaler strictly on Train split only (No data leakage!)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # 5. Initialize & Train Selected Model
        model_type = (req.model_type or "random_forest").lower()
        if model_type == "gradient_boosting":
            model = GradientBoostingRegressor(
                n_estimators=120,
                learning_rate=0.05,
                max_depth=4,
                random_state=42
            )
            model_display_name = "Gradient Boosting Regressor (XGBoost Architecture)"
        elif model_type == "linear_baseline":
            model = Ridge(alpha=10.0, random_state=42)
            model_display_name = "Ridge Regularized Linear Model"
        else:
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=6,
                min_samples_leaf=3,
                random_state=42,
                n_jobs=-1
            )
            model_display_name = "Random Forest Regressor (Ensemble Trees)"

        # Train model
        model.fit(X_train_scaled, y_train)

        # 6. Evaluate on out-of-sample Test Set
        y_pred_test = model.predict(X_test_scaled)
        metrics = evaluate_predictions(
            y_true=y_test,
            y_pred=y_pred_test,
            y_baseline=y_baseline_test,
            y_prior=y_prior_test
        )

        # Calculate standard deviation of residuals for 95% confidence intervals
        residuals = y_test - y_pred_test
        std_resid = float(np.std(residuals)) if len(residuals) > 0 else (current_price * 0.03)

        # 7. Predict Future Price using the latest available bar features
        latest_features_row = feature_df.iloc[[-1]][feature_cols]
        # In case latest row has any minor NaN in late features, fill with recent valid
        latest_features_row = latest_features_row.ffill().bfill()
        X_latest_scaled = scaler.transform(latest_features_row.values)
        predicted_val = float(model.predict(X_latest_scaled)[0])

        # Clamp against extreme unrealistic extrapolation (maximum 40% change for single horizon)
        max_allowed = current_price * 1.40
        min_allowed = current_price * 0.60
        predicted_val = max(min(predicted_val, max_allowed), min_allowed)

        expected_change = round(predicted_val - current_price, 2)
        expected_change_pct = round((expected_change / current_price) * 100, 2)

        # Determine trend
        if expected_change_pct > 1.5:
            trend = "Bullish"
        elif expected_change_pct < -1.5:
            trend = "Bearish"
        else:
            trend = "Neutral"

        # Confidence intervals
        conf_lower = round(max(predicted_val - (1.96 * std_resid), current_price * 0.5), 2)
        conf_upper = round(predicted_val + (1.96 * std_resid), 2)

        # 8. Build Recent Historical Chart Points (last 90 days for frontend visualization)
        recent_df = df.tail(90)
        historical_chart: List[HistoricalDataPoint] = []
        for index, row in recent_df.iterrows():
            date_str = index.strftime("%Y-%m-%d") if hasattr(index, "strftime") else str(index)[:10]
            historical_chart.append(HistoricalDataPoint(
                date=date_str,
                open=round(float(row["Open"]), 2),
                high=round(float(row["High"]), 2),
                low=round(float(row["Low"]), 2),
                close=round(float(row["Close"]), 2),
                volume=int(row["Volume"]) if "Volume" in row and not pd.isna(row["Volume"]) else 0
            ))

        # 9. Build Forecast Trajectory Points (Smooth chronological step-out)
        last_date = recent_df.index[-1]
        forecast_points: List[PredictedPoint] = []
        
        # Intermediate steps count
        steps = horizon_days if horizon_days <= 7 else 10
        date_increments = np.linspace(1, horizon_days, steps)
        price_increments = np.linspace(current_price, predicted_val, steps)

        for step_i, (day_inc, price_inc) in enumerate(zip(date_increments, price_increments)):
            # Add business/calendar days
            target_date = last_date + datetime.timedelta(days=int(np.ceil(day_inc)))
            target_date_str = target_date.strftime("%Y-%m-%d") if hasattr(target_date, "strftime") else str(target_date)[:10]

            # Expanding uncertainty cone as horizon expands
            cone_factor = float(np.sqrt(day_inc / horizon_days))
            step_lower = round(max(price_inc - (1.96 * std_resid * cone_factor), current_price * 0.5), 2)
            step_upper = round(price_inc + (1.96 * std_resid * cone_factor), 2)

            forecast_points.append(PredictedPoint(
                date=target_date_str,
                price=round(float(price_inc), 2),
                confidence_lower=step_lower,
                confidence_upper=step_upper
            ))

        meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
        company_name = meta["name"] if meta else clean_symbol
        now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        disclaimer_text = (
            "AI predictions are mathematical estimates derived from historical price action and technical indicators. "
            "They are not guaranteed to predict future market performance, and confidence bands do not represent "
            "guaranteed probabilities of profit. Always conduct your own independent research and manage portfolio risk."
        )

        return PredictionResponse(
            symbol=clean_symbol,
            name=company_name,
            current_price=current_price,
            predicted_price=round(predicted_val, 2),
            expected_change=expected_change,
            expected_change_percent=expected_change_pct,
            trend=trend,
            prediction_horizon=req.horizon,
            model_name=model_display_name,
            metrics=metrics,
            features_used=feature_cols,
            historical_chart=historical_chart,
            forecast_points=forecast_points,
            confidence_interval={
                "lower_bound": conf_lower,
                "upper_bound": conf_upper,
                "residual_std": round(std_resid, 2)
            },
            disclaimer=disclaimer_text,
            generated_at=now_iso
        )

