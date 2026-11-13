import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional

SYMBOL_MAP = {
    "NIFTY50": "^NSEI",
    "SENSEX": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "WIPRO": "WIPRO.NS",
    "SBIN": "SBIN.NS",
}

INTERVAL_MAP = {
    "1m": "1m", "5m": "5m", "15m": "15m",
    "1h": "1h", "1D": "1d", "1W": "1wk",
}

PERIOD_MAP = {
    "1m": "1d", "5m": "5d", "15m": "1mo",
    "1h": "3mo", "1D": "1y", "1W": "5y",
}


def resolve_symbol(symbol: str) -> str:
    return SYMBOL_MAP.get(symbol.upper(), symbol)


def get_quote(symbol: str) -> dict:
    ticker_sym = resolve_symbol(symbol)
    t = yf.Ticker(ticker_sym)
    info = t.fast_info
    hist = t.history(period="2d", interval="1d")

    if hist.empty:
        return {"symbol": symbol, "ltp": 0, "open": 0, "high": 0, "low": 0, "close": 0, "change": 0, "change_pct": 0, "volume": 0}

    latest = hist.iloc[-1]
    prev_close = hist.iloc[-2]["Close"] if len(hist) >= 2 else latest["Close"]
    ltp = float(latest["Close"])
    change = ltp - float(prev_close)
    change_pct = (change / float(prev_close)) * 100 if prev_close else 0

    return {
        "symbol": symbol,
        "ltp": round(ltp, 2),
        "open": round(float(latest["Open"]), 2),
        "high": round(float(latest["High"]), 2),
        "low": round(float(latest["Low"]), 2),
        "close": round(ltp, 2),
        "change": round(change, 2),
        "change_pct": round(change_pct, 2),
        "volume": int(latest.get("Volume", 0)),
    }


def get_ohlc(symbol: str, interval: str = "5m") -> list:
    ticker_sym = resolve_symbol(symbol)
    yf_interval = INTERVAL_MAP.get(interval, "1d")
    yf_period = PERIOD_MAP.get(interval, "1mo")

    t = yf.Ticker(ticker_sym)
    hist = t.history(period=yf_period, interval=yf_interval)

    if hist.empty:
        return []

    result = []
    for ts, row in hist.iterrows():
        t_val = int(pd.Timestamp(ts).timestamp())
        result.append({
            "time": t_val,
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row.get("Volume", 0)),
        })

    return result
