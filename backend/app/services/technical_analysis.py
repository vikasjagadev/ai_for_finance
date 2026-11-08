import datetime
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import yfinance as yf
from app.schemas.schemas import TechnicalIndicatorsResponse, IndicatorExplanation

class TechnicalAnalysisService:

    @staticmethod
    def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / (loss + 1e-9)
        rsi = 100 - (100 / (1 + rs))
        return rsi

    @staticmethod
    def compute_indicators(symbol: str) -> TechnicalIndicatorsResponse:
        clean_symbol = symbol.strip().upper()
        ticker = yf.Ticker(clean_symbol)
        df = ticker.history(period="1y")

        if df.empty or len(df) < 30:
            # Fallback to broader period if needed
            df = ticker.history(period="2y")
            if df.empty:
                raise ValueError(f"Insufficient historical data available for {clean_symbol}")

        close = df["Close"]
        current_price = round(float(close.iloc[-1]), 2)

        # 1. Moving Averages
        sma_20 = round(float(close.rolling(window=20).mean().iloc[-1]), 2) if len(close) >= 20 else current_price
        sma_50 = round(float(close.rolling(window=50).mean().iloc[-1]), 2) if len(close) >= 50 else current_price
        sma_200 = round(float(close.rolling(window=200).mean().iloc[-1]), 2) if len(close) >= 200 else current_price

        ema_12 = round(float(close.ewm(span=12, adjust=False).mean().iloc[-1]), 2)
        ema_26 = round(float(close.ewm(span=26, adjust=False).mean().iloc[-1]), 2)

        # 2. RSI (14)
        rsi_series = TechnicalAnalysisService.calculate_rsi(close, 14)
        rsi_value = round(float(rsi_series.iloc[-1]), 2) if not pd.isna(rsi_series.iloc[-1]) else 50.0

        # 3. MACD
        macd_series = close.ewm(span=12, adjust=False).mean() - close.ewm(span=26, adjust=False).mean()
        signal_series = macd_series.ewm(span=9, adjust=False).mean()
        hist_series = macd_series - signal_series

        macd_val = round(float(macd_series.iloc[-1]), 3)
        signal_val = round(float(signal_series.iloc[-1]), 3)
        hist_val = round(float(hist_series.iloc[-1]), 3)

        # 4. Bollinger Bands (20-day, 2 std dev)
        rolling_mean_20 = close.rolling(window=20).mean()
        rolling_std_20 = close.rolling(window=20).std()
        upper_band = round(float((rolling_mean_20 + (rolling_std_20 * 2)).iloc[-1]), 2) if len(close) >= 20 else current_price * 1.05
        lower_band = round(float((rolling_mean_20 - (rolling_std_20 * 2)).iloc[-1]), 2) if len(close) >= 20 else current_price * 0.95
        middle_band = sma_20

        # 5. Support & Resistance estimates
        recent_window = df.tail(60)
        recent_high = round(float(recent_window["High"].max()), 2)
        recent_low = round(float(recent_window["Low"].min()), 2)
        pivot = round((current_price + recent_high + recent_low) / 3, 2)
        r1 = round((2 * pivot) - recent_low, 2)
        s1 = round((2 * pivot) - recent_high, 2)

        # Explanations & Signals
        explanations: Dict[str, IndicatorExplanation] = {}
        insights: List[str] = []

        # RSI analysis
        if rsi_value >= 70:
            rsi_sig = "Overbought"
            rsi_desc = f"RSI is currently {rsi_value}, indicating the stock may be overextended to the upside. Price could experience short-term consolidation or pullback."
            insights.append(f"RSI at {rsi_value} signals overbought conditions; caution on chasing immediate highs.")
        elif rsi_value <= 30:
            rsi_sig = "Oversold"
            rsi_desc = f"RSI is currently {rsi_value}, indicating heavy selling pressure. Historically, extreme oversold readings can precede mean-reversion rallies."
            insights.append(f"RSI at {rsi_value} indicates deeply oversold territory, potential technical bounce candidate.")
        elif rsi_value > 55:
            rsi_sig = "Bullish"
            rsi_desc = f"RSI is {rsi_value}, positioned comfortably in the bullish expansion zone above 50, reflecting positive upward momentum."
            insights.append(f"RSI at {rsi_value} demonstrates solid upward buyer momentum.")
        else:
            rsi_sig = "Neutral"
            rsi_desc = f"RSI is {rsi_value}, reflecting balanced equilibrium between buyers and sellers."

        explanations["rsi"] = IndicatorExplanation(
            signal=rsi_sig,
            summary=f"RSI (14) = {rsi_value} ({rsi_sig})",
            description=rsi_desc
        )

        # Moving Average Trend & Crossover
        if current_price > sma_50 > sma_200:
            ma_sig = "Strong Bullish"
            ma_desc = f"The stock ({current_price}) is trading comfortably above both its 50-day SMA ({sma_50}) and 200-day SMA ({sma_200}), a classic textbook long-term bull market setup."
            insights.append(f"Price is sustaining above key 50-day ({sma_50}) and 200-day ({sma_200}) SMAs, confirming strong institutional trend support.")
        elif current_price < sma_50 < sma_200:
            ma_sig = "Bearish"
            ma_desc = f"Price is trading beneath both its 50-day SMA ({sma_50}) and 200-day SMA ({sma_200}), indicating persistent multi-month downward pressure."
            insights.append(f"Trading below the 50-day and 200-day moving averages signals macro caution.")
        elif current_price > sma_20:
            ma_sig = "Bullish"
            ma_desc = f"Price is above the short-term 20-day SMA ({sma_20}), indicating healthy short-term buyer absorption."
            insights.append(f"Short-term momentum is positive with price above 20-day SMA ({sma_20}).")
        else:
            ma_sig = "Neutral"
            ma_desc = f"The stock is consolidating near its 20-day moving average ({sma_20})."

        explanations["moving_averages"] = IndicatorExplanation(
            signal=ma_sig,
            summary=f"SMA 20: {sma_20} | SMA 50: {sma_50} | SMA 200: {sma_200}",
            description=ma_desc
        )

        # MACD
        if macd_val > signal_val:
            macd_sig = "Bullish"
            macd_desc = f"MACD line ({macd_val}) is above the 9-day signal line ({signal_val}) with positive histogram (+{hist_val}), confirming constructive momentum."
            insights.append("MACD histogram is positive, signaling expanding bullish momentum.")
        else:
            macd_sig = "Bearish"
            macd_desc = f"MACD line ({macd_val}) is below the signal line ({signal_val}) with negative histogram ({hist_val}), suggesting softening momentum."
            insights.append("MACD is below its signal line, reflecting ongoing consolidation or downward momentum.")

        explanations["macd"] = IndicatorExplanation(
            signal=macd_sig,
            summary=f"MACD: {macd_val} | Signal: {signal_val} | Hist: {hist_val}",
            description=macd_desc
        )

        # Bollinger Bands
        bb_width_pct = round(((upper_band - lower_band) / middle_band) * 100, 2)
        if current_price >= upper_band:
            bb_sig = "Overbought"
            bb_desc = f"Price is testing or piercing the upper Bollinger Band ({upper_band}). Bands are {bb_width_pct}% wide."
        elif current_price <= lower_band:
            bb_sig = "Oversold"
            bb_desc = f"Price is touching the lower Bollinger Band ({lower_band}), indicating potential short-term value support."
        else:
            bb_sig = "Neutral"
            bb_desc = f"Price is trading well within the dynamic volatility corridor between {lower_band} and {upper_band}."

        explanations["bollinger"] = IndicatorExplanation(
            signal=bb_sig,
            summary=f"Upper: {upper_band} | Mid: {middle_band} | Lower: {lower_band}",
            description=bb_desc
        )

        # Important price levels insight
        insights.append(f"Key technical resistance is estimated near {recent_high} (R1: {r1}), with crucial downside support around {recent_low} (S1: {s1}).")

        # Volatility assessment
        hist_vol = round(float(df["Close"].pct_change().std() * np.sqrt(252) * 100), 2)
        insights.append(f"Annualized historical volatility is {hist_vol}%, representing {'moderate to elevated' if hist_vol > 30 else 'stable and disciplined'} market dynamics.")

        now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        return TechnicalIndicatorsResponse(
            symbol=clean_symbol,
            current_price=current_price,
            timestamp=now_iso,
            indicators={
                "sma_20": sma_20,
                "sma_50": sma_50,
                "sma_200": sma_200,
                "ema_12": ema_12,
                "ema_26": ema_26,
                "rsi_14": rsi_value,
                "macd_line": macd_val,
                "macd_signal": signal_val,
                "macd_histogram": hist_val,
                "bollinger_upper": upper_band,
                "bollinger_middle": middle_band,
                "bollinger_lower": lower_band,
                "bollinger_width_percent": bb_width_pct,
                "annualized_volatility_percent": hist_vol
            },
            explanations=explanations,
            insights=insights,
            support_resistance={
                "pivot": pivot,
                "resistance_1": r1,
                "resistance_swing_high": recent_high,
                "support_1": s1,
                "support_swing_low": recent_low
            }
        )

