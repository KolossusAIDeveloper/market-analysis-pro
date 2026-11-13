from fastapi import APIRouter
from app.services.sentiment import get_prediction

router = APIRouter()


@router.get("/predict/{symbol}")
async def predict(symbol: str):
    return get_prediction(symbol)
