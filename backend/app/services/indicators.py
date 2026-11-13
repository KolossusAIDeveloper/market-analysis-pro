import pandas as pd
import numpy as np
from app.services.market_data import get_ohlc


def compute_indicator(symbol: str, indicator_type: str, period: int = 14, interval: str = "1D") -> dict:
    bars = get_ohlc(symbol, interval)
    if not bars:
        return {"symbol": symbol, "type": indicator_type, "values": []}

    df = pd.DataFrame(bars)
    df["close"] = df["close"].astype(float)
    df["high"] = df["high"].astype(float)
    df["low"] = df["low"].astype(float)
    df["volume"] = df["volume"].astype(float)

    values = []
    ind = indicator_type.upper()

    if ind == "RSI":
        delta = df["close"].diff()
        gain = delta.clip(lower=0).rolling(period).mean()
        loss = (-delta.clip(upper=0)).rolling(period).mean()
        rs = gain / loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + rs))
        values = [{"time": int(df["time"].iloc[i]), "value": round(float(v), 2)}
                  for i, v in enumerate(rsi) if not np.isnan(v)]

    elif ind in ("SMA", "EMA"):
        series = df["close"].rolling(period).mean() if ind == "SMA" else df["close"].ewm(span=period).mean()
        values = [{"time": int(df["time"].iloc[i]), "value": round(float(v), 2)}
                  for i, v in enumerate(series) if not np.isnan(v)]

    elif ind == "MACD":
        ema12 = df["close"].ewm(span=12).mean()
        ema26 = df["close"].ewm(span=26).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=9).mean()
        values = [
            {"time": int(df["time"].iloc[i]), "macd": round(float(macd_line.iloc[i]), 2),
             "signal": round(float(signal_line.iloc[i]), 2),
             "hist": round(float(macd_line.iloc[i] - signal_line.iloc[i]), 2)}
            for i in range(len(df))
            if not np.isnan(macd_line.iloc[i])
        ]

    elif ind == "BB":
        sma = df["close"].rolling(period).mean()
        std = df["close"].rolling(period).std()
        upper = sma + 2 * std
        lower = sma - 2 * std
        values = [
            {"time": int(df["time"].iloc[i]),
             "upper": round(float(upper.iloc[i]), 2),
             "middle": round(float(sma.iloc[i]), 2),
             "lower": round(float(lower.iloc[i]), 2)}
            for i in range(len(df)) if not np.isnan(sma.iloc[i])
        ]

    elif ind == "ATR":
        high_low = df["high"] - df["low"]
        high_prev = (df["high"] - df["close"].shift()).abs()
        low_prev = (df["low"] - df["close"].shift()).abs()
        tr = pd.concat([high_low, high_prev, low_prev], axis=1).max(axis=1)
        atr = tr.rolling(period).mean()
        values = [{"time": int(df["time"].iloc[i]), "value": round(float(v), 2)}
                  for i, v in enumerate(atr) if not np.isnan(v)]

    return {"symbol": symbol, "type": indicator_type, "period": period, "values": values[-200:]}
