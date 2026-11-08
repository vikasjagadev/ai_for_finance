from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.market_data import MarketDataService
from app.services.technical_analysis import TechnicalAnalysisService
from app.schemas.schemas import StockSearchResult, StockQuote, StockHistoryResponse, TechnicalIndicatorsResponse

router = APIRouter(prefix="/stocks", tags=["Stocks & Analysis"])

@router.get("/search", response_model=List[StockSearchResult])
def search_stocks(q: str = Query("", description="Symbol or company name to search")):
    try:
        return MarketDataService.search_stocks(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stock search failed: {str(e)}")

@router.get("/{symbol}/quote", response_model=StockQuote)
def get_quote(symbol: str):
    try:
        return MarketDataService.get_stock_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Unable to retrieve quote for symbol '{symbol}': {str(e)}")

@router.get("/{symbol}/history", response_model=StockHistoryResponse)
def get_history(
    symbol: str,
    period: str = Query("1y", description="Timeframe: 1d, 5d, 1mo, 6mo, 1y, 5y, max"),
    interval: str = Query("1d", description="Interval: 1m, 5m, 1h, 1d, 1wk")
):
    try:
        return MarketDataService.get_stock_history(symbol, period=period, interval=interval)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch historical data for '{symbol}': {str(e)}")

@router.get("/{symbol}/indicators", response_model=TechnicalIndicatorsResponse)
def get_indicators(symbol: str):
    try:
        return TechnicalAnalysisService.compute_indicators(symbol)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute technical indicators for '{symbol}': {str(e)}")

