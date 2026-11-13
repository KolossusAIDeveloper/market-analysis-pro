from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

# Paper trading positions (in-memory)
_positions: list = []
_audit_log: list = []


class OrderRequest(BaseModel):
    symbol: str
    qty: int
    order_type: str = "MARKET"
    side: str = "BUY"
    price: float = 0
    strategy_id: str = "manual"


@router.get("/positions")
async def get_positions():
    return _positions


@router.post("/order")
async def place_order(order: OrderRequest):
    # Paper trading: simulate fill
    fill_price = order.price if order.price > 0 else round(random.uniform(100, 50000), 2)

    if order.side == "BUY":
        existing = next((p for p in _positions if p["symbol"] == order.symbol), None)
        if existing:
            total_qty = existing["qty"] + order.qty
            existing["avg_price"] = round(
                (existing["avg_price"] * existing["qty"] + fill_price * order.qty) / total_qty, 2
            )
            existing["qty"] = total_qty
        else:
            _positions.append({
                "symbol": order.symbol,
                "qty": order.qty,
                "avg_price": fill_price,
                "ltp": fill_price,
                "pnl": 0,
                "pnl_pct": 0,
            })
    elif order.side == "SELL":
        _positions[:] = [p for p in _positions if p["symbol"] != order.symbol]

    log_entry = {
        "symbol": order.symbol,
        "side": order.side,
        "qty": order.qty,
        "fill_price": fill_price,
        "strategy_id": order.strategy_id,
        "mode": "paper",
    }
    _audit_log.append(log_entry)

    return {"status": "filled", "fill_price": fill_price, "mode": "paper", **log_entry}


@router.get("/audit-log")
async def get_audit_log():
    return _audit_log
