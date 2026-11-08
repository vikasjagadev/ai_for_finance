from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.news_service import NewsService
from app.schemas.schemas import NewsArticle

router = APIRouter(prefix="/news", tags=["News"])

@router.get("", response_model=List[NewsArticle])
def get_news(symbol: Optional[str] = Query(None, description="Optional stock ticker to filter news")):
    return NewsService.get_financial_news(symbol)

