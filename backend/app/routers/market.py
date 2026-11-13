from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from app.services.market_data import get_quote, get_ohlc
from app.services.indicators import compute_indicator
import asyncio
import json

router = APIRouter()


@router.get("/quote/{symbol}")
async def quote(symbol: str):
    return get_quote(symbol)


@router.get("/ohlc/{symbol}")
async def ohlc(symbol: str, interval: str = Query("1D")):
    return get_ohlc(symbol, interval)


@router.get("/indicator/{symbol}")
async def indicator(
    symbol: str,
    type: str = Query("RSI"),
    period: int = Query(14),
    interval: str = Query("1D"),
):
    return compute_indicator(symbol, type, period, interval)


@router.websocket("/ws/market/{symbol}")
async def ws_market(websocket: WebSocket, symbol: str):
    await websocket.accept()
    try:
        while True:
            data = get_quote(symbol)
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
