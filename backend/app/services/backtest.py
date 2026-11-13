import math
import random
from app.services.market_data import get_ohlc


def run_backtest(symbol: str, rules: list, start_date: str, end_date: str, capital: float) -> dict:
    bars = get_ohlc(symbol, "1D")

    if not bars:
        return _empty_result(capital)

    # Filter to date range
    filtered = [b for b in bars]  # simplified; real impl would filter by date

    closes = [b["close"] for b in filtered]
    if len(closes) < 20:
        return _empty_result(capital)

    # Simple RSI-based simulation matching rule structure
    equity = [capital]
    trades = []
    position = 0
    entry_price = 0

    for i in range(14, len(closes)):
        rsi = _compute_rsi(closes[:i+1])
        price = closes[i]

        # Evaluate rules (simplified)
        buy_signal = any(
            r.get("indicator") == "RSI" and r.get("operator") == "<" and rsi < float(r.get("value", 30))
            for r in rules
        )
        sell_signal = any(
            r.get("indicator") == "RSI" and r.get("operator") == ">" and rsi > float(r.get("value", 70))
            for r in rules
        ) or (position and rsi > 65)

        if buy_signal and position == 0:
            position = int(equity[-1] * 0.95 / price)
            entry_price = price
        elif sell_signal and position > 0:
            pnl = (price - entry_price) * position
            equity.append(equity[-1] + pnl)
            trades.append({"entry": entry_price, "exit": price, "pnl": pnl, "qty": position})
            position = 0
        else:
            equity.append(equity[-1] + (price - closes[i-1]) * position)

    if not trades:
        return _empty_result(capital)

    final = equity[-1]
    total_return = ((final - capital) / capital) * 100
    n_years = max(len(closes) / 252, 1/12)
    cagr = ((final / capital) ** (1 / n_years) - 1) * 100

    returns = [(equity[i] - equity[i-1]) / equity[i-1] for i in range(1, len(equity)) if equity[i-1] != 0]
    sharpe = 0
    if returns:
        avg_r = sum(returns) / len(returns)
        std_r = math.sqrt(sum((r - avg_r)**2 for r in returns) / max(len(returns)-1, 1))
        sharpe = round((avg_r / std_r) * math.sqrt(252), 2) if std_r > 0 else 0

    # Max drawdown
    peak = capital
    max_dd = 0
    for v in equity:
        if v > peak: peak = v
        dd = (peak - v) / peak * 100
        if dd > max_dd: max_dd = dd

    wins = [t for t in trades if t["pnl"] > 0]
    win_rate = len(wins) / len(trades) * 100 if trades else 0

    equity_curve = [
        {"date": f"2023-{(i//21)+1:02d}-{(i%21)+1:02d}", "value": round(v, 2)}
        for i, v in enumerate(equity[::max(1, len(equity)//100)])
    ]

    return {
        "total_return": round(total_return, 2),
        "cagr": round(cagr, 2),
        "sharpe": sharpe,
        "max_drawdown": round(max_dd, 2),
        "win_rate": round(win_rate, 1),
        "num_trades": len(trades),
        "equity_curve": equity_curve,
    }


def _compute_rsi(closes: list, period: int = 14) -> float:
    if len(closes) < period + 1:
        return 50.0
    deltas = [closes[i] - closes[i-1] for i in range(1, len(closes))]
    gains = [max(d, 0) for d in deltas[-period:]]
    losses = [max(-d, 0) for d in deltas[-period:]]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def _empty_result(capital: float) -> dict:
    return {
        "total_return": 0.0,
        "cagr": 0.0,
        "sharpe": 0.0,
        "max_drawdown": 0.0,
        "win_rate": 0.0,
        "num_trades": 0,
        "equity_curve": [{"date": "2023-01-01", "value": capital}],
    }
