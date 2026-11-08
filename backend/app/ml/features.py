import pandas as pd
import numpy as np

def build_features(df: pd.DataFrame, horizon_days: int = 1) -> tuple[pd.DataFrame, list[str]]:
    """
    Constructs leak-free technical and quantitative features from historical OHLCV data.
    All features at time t depend strictly on data available at or before time t.
    Target at time t is Close price shifted forward by horizon_days.
    """
    data = df.copy()

    # Ensure required columns exist
    for col in ["Open", "High", "Low", "Close", "Volume"]:
        if col not in data.columns:
            raise ValueError(f"Missing required column '{col}' for feature generation.")

    close = data["Close"]
    volume = data["Volume"].replace(0, np.nan).ffill().fillna(1.0)

    # 1. Price Momentum & Returns
    data["return_1d"] = close.pct_change(1)
    data["return_3d"] = close.pct_change(3)
    data["return_5d"] = close.pct_change(5)
    data["return_10d"] = close.pct_change(10)

    # 2. Lagged Prices
    data["lag_1"] = close.shift(1)
    data["lag_2"] = close.shift(2)
    data["lag_3"] = close.shift(3)
    data["lag_5"] = close.shift(5)

    # 3. Rolling Moving Averages and Ratios
    data["sma_5"] = close.rolling(window=5).mean()
    data["sma_10"] = close.rolling(window=10).mean()
    data["sma_20"] = close.rolling(window=20).mean()
    data["sma_50"] = close.rolling(window=50).mean()

    data["price_to_sma_5"] = close / (data["sma_5"] + 1e-9)
    data["price_to_sma_20"] = close / (data["sma_20"] + 1e-9)

    # 4. Spreads and Volatility
    data["hl_spread"] = (data["High"] - data["Low"]) / (close + 1e-9)
    data["co_spread"] = (close - data["Open"]) / (data["Open"] + 1e-9)
    data["volatility_10d"] = data["return_1d"].rolling(window=10).std()
    data["volatility_20d"] = data["return_1d"].rolling(window=20).std()

    # 5. Volume Trend
    vol_sma_20 = volume.rolling(window=20).mean()
    data["volume_ratio"] = volume / (vol_sma_20 + 1e-9)

    # 6. Technical RSI (14)
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / (loss + 1e-9)
    data["rsi_14"] = 100 - (100 / (1 + rs))

    # 7. MACD
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema_12 - ema_26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    data["macd_hist"] = macd_line - signal_line

    feature_cols = [
        "return_1d", "return_3d", "return_5d", "return_10d",
        "lag_1", "lag_2", "lag_3", "lag_5",
        "price_to_sma_5", "price_to_sma_20",
        "hl_spread", "co_spread", "volatility_10d", "volatility_20d",
        "volume_ratio", "rsi_14", "macd_hist"
    ]

    # Target variable: Close price horizon_days into the future
    data["target"] = close.shift(-horizon_days)

    return data, feature_cols

