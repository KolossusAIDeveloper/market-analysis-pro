import random
import math
from datetime import datetime, timezone
from app.services.market_data import get_ohlc


def compute_rsi(closes: list, period: int = 14) -> float:
    if len(closes) < period + 1:
        return 50.0
    deltas = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    gains = [d for d in deltas[-period:] if d > 0]
    losses = [-d for d in deltas[-period:] if d < 0]
    avg_gain = sum(gains) / period if gains else 0
    avg_loss = sum(losses) / period if losses else 1e-9
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)


def get_prediction(symbol: str) -> dict:
    bars = get_ohlc(symbol, "1D")
    closes = [b["close"] for b in bars[-60:]] if bars else []

    rsi = compute_rsi(closes) if closes else 50.0

    # Simulated feature values (would come from real data/ML in production)
    seed = int(datetime.now().timestamp() / 3600)
    rng = random.Random(seed)

    pcr = round(rng.uniform(0.7, 1.4), 2)
    fii_net = rng.randint(-3000, 3000)
    news_scores = ["Positive", "Negative", "Neutral"]
    news_sentiment = rng.choice(news_scores)
    sentiment_score = round(rng.uniform(-0.5, 0.5), 3)

    macd_signal = "Bullish" if rsi < 50 else "Bearish"

    # Simple heuristic "model"
    bull_score = 0
    if rsi < 40: bull_score += 2
    elif rsi < 55: bull_score += 1
    if pcr < 0.9: bull_score += 1
    if pcr > 1.2: bull_score -= 1
    if fii_net > 500: bull_score += 1
    elif fii_net < -500: bull_score -= 1
    if news_sentiment == "Positive": bull_score += 1
    elif news_sentiment == "Negative": bull_score -= 1

    if bull_score >= 3:
        direction = "UP"
        confidence = min(0.95, 0.55 + bull_score * 0.07)
    elif bull_score <= -1:
        direction = "DOWN"
        confidence = min(0.90, 0.50 + abs(bull_score) * 0.07)
    else:
        direction = "SIDEWAYS"
        confidence = 0.45 + rng.uniform(0, 0.1)

    rationale_map = {
        "UP": f"RSI at {rsi:.1f} indicates oversold conditions. FII activity shows {'buying' if fii_net > 0 else 'mixed'} interest. News sentiment is {news_sentiment.lower()}, supporting a cautious bullish bias for {symbol}.",
        "DOWN": f"RSI at {rsi:.1f} with bearish MACD crossover. FII sold ₹{abs(fii_net)}Cr. {news_sentiment} news flow adds to downside pressure on {symbol}.",
        "SIDEWAYS": f"Mixed signals across indicators for {symbol}. RSI neutral at {rsi:.1f}, PCR at {pcr} near equilibrium. Await clearer directional cues before positioning.",
    }

    return {
        "symbol": symbol,
        "direction": direction,
        "confidence": round(confidence, 3),
        "sentiment_score": sentiment_score,
        "rationale": rationale_map[direction],
        "features": {
            "rsi": rsi,
            "macd_signal": macd_signal,
            "pcr": pcr,
            "fii_net": fii_net,
            "news_sentiment": news_sentiment,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
