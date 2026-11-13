from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
from app.services.backtest import run_backtest
import uuid

router = APIRouter()

# In-memory store (use Postgres in production)
_strategies: list = []


class Rule(BaseModel):
    id: str
    indicator: str
    operator: str
    value: Any
    action: str


class StrategyCreate(BaseModel):
    name: str
    rules: list[Rule]


class BacktestRequest(BaseModel):
    strategy_id: str = "custom"
    rules: list[Rule] = []
    symbol: str = "NIFTY50"
    start_date: str = "2023-01-01"
    end_date: str = "2024-01-01"
    capital: float = 100000


@router.get("/strategies")
async def list_strategies():
    return _strategies


@router.post("/strategies")
async def create_strategy(payload: StrategyCreate):
    strategy = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "rules": [r.model_dump() for r in payload.rules],
        "created_at": "2024-01-01T00:00:00",
    }
    _strategies.append(strategy)
    return strategy


@router.post("/backtest/run")
async def backtest(req: BacktestRequest):
    rules_dicts = [r.model_dump() for r in req.rules]
    return run_backtest(req.symbol, rules_dicts, req.start_date, req.end_date, req.capital)
