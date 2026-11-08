from fastapi import APIRouter, HTTPException
from typing import List
from app.services.market_data import MarketDataService
from app.schemas.schemas import MarketOverviewResponse, MarketStatsResponse, StockGainerLoser

router = APIRouter(prefix="/market", tags=["Market"])

@router.get("/overview", response_model=MarketOverviewResponse)
def get_market_overview():
    try:
        return MarketDataService.get_market_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market overview: {str(e)}")

@router.get("/stats", response_model=MarketStatsResponse)
def get_market_stats():
    try:
        data = MarketDataService.get_market_stats_and_movers()
        return data["stats"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate market statistics: {str(e)}")

@router.get("/gainers", response_model=List[StockGainerLoser])
def get_top_gainers():
    try:
        data = MarketDataService.get_market_stats_and_movers()
        return data["gainers"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top gainers: {str(e)}")

@router.get("/losers", response_model=List[StockGainerLoser])
def get_top_losers():
    try:
        data = MarketDataService.get_market_stats_and_movers()
        return data["losers"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top losers: {str(e)}")

