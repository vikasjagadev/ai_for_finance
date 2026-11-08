from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.config import settings, update_env_variable
from app.schemas.schemas import ApiKeyConfig, ApiKeyStatusResponse, TestKeyRequest, TestKeyResponse
from app.services.market_data import MarketDataService

router = APIRouter(prefix="/settings", tags=["API Keys & Settings"])

def mask_key(k: str) -> str:
    if not k:
        return ""
    if len(k) <= 6:
        return "***"
    return f"{k[:3]}...{k[-3:]}"

@router.get("/keys", response_model=ApiKeyStatusResponse)
def get_api_key_status():
    twelve = settings.TWELVE_DATA_API_KEY
    finnhub = settings.FINNHUB_API_KEY
    alpha = settings.ALPHA_VANTAGE_API_KEY
    polygon = settings.POLYGON_API_KEY

    # Determine active provider
    if twelve:
        active = "Twelve Data (Live API Key Active)"
    elif finnhub:
        active = "Finnhub (Real-time Live API Active)"
    elif alpha:
        active = "Alpha Vantage (Live API Key Active)"
    else:
        active = "Market Engine (Zero-Config Direct Feed)"

    return ApiKeyStatusResponse(
        twelve_data_configured=bool(twelve),
        twelve_data_masked=mask_key(twelve),
        finnhub_configured=bool(finnhub),
        finnhub_masked=mask_key(finnhub),
        alpha_vantage_configured=bool(alpha),
        alpha_vantage_masked=mask_key(alpha),
        polygon_configured=bool(polygon),
        polygon_masked=mask_key(polygon),
        active_provider=active,
        message="Market data provider keys loaded."
    )

@router.post("/keys", response_model=ApiKeyStatusResponse)
def update_api_keys(payload: ApiKeyConfig):
    if payload.twelve_data_api_key is not None:
        update_env_variable("TWELVE_DATA_API_KEY", payload.twelve_data_api_key.strip())
    if payload.finnhub_api_key is not None:
        update_env_variable("FINNHUB_API_KEY", payload.finnhub_api_key.strip())
    if payload.alpha_vantage_api_key is not None:
        update_env_variable("ALPHA_VANTAGE_API_KEY", payload.alpha_vantage_api_key.strip())
    if payload.polygon_api_key is not None:
        update_env_variable("POLYGON_API_KEY", payload.polygon_api_key.strip())

    return get_api_key_status()

@router.post("/test-key", response_model=TestKeyResponse)
def test_key(payload: TestKeyRequest):
    res = MarketDataService.test_api_key(
        provider=payload.provider,
        api_key=payload.api_key,
        symbol=payload.symbol or "AAPL"
    )
    return TestKeyResponse(
        success=res.get("success", False),
        message=res.get("message", ""),
        provider=res.get("provider", payload.provider),
        sample_quote=res.get("sample_quote")
    )

