import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pytest
from fastapi.testclient import TestClient


def test_app_imports():
    from app.main import app
    assert app is not None


def test_services_import():
    from app.services.indicators import compute_indicator
    from app.services.sentiment import get_prediction
    from app.services.backtest import run_backtest
    assert callable(compute_indicator)
    assert callable(get_prediction)
    assert callable(run_backtest)


def test_backtest_empty():
    from app.services.backtest import _empty_result
    result = _empty_result(100000)
    assert result["num_trades"] == 0
    assert result["total_return"] == 0.0


def test_rsi_computation():
    from app.services.sentiment import compute_rsi
    closes = [100 + i * 0.5 for i in range(30)]
    rsi = compute_rsi(closes)
    assert 0 <= rsi <= 100


def test_quote_endpoint():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/market/quote/NIFTY50")
    assert resp.status_code == 200
    data = resp.json()
    assert "ltp" in data
    assert "symbol" in data


def test_predict_endpoint():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/predict/NIFTY50")
    assert resp.status_code == 200
    data = resp.json()
    assert data["direction"] in ("UP", "DOWN", "SIDEWAYS")
    assert "confidence" in data


def test_strategies_endpoint():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/strategies")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_broker_positions_endpoint():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/broker/positions")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
