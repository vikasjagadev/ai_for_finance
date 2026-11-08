from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


# --- Market Overview Schemas ---
class IndexQuote(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    current_value: float
    change: float
    change_percent: float
    high: float
    low: float
    open: float
    previous_close: float
    status: str
    last_updated: str

class MarketOverviewResponse(BaseModel):
    indices: List[IndexQuote]
    timestamp: str

class StockGainerLoser(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    current_price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None

class MarketStatsResponse(BaseModel):
    tracked_stocks_count: int
    gainers_count: int
    losers_count: int
    neutral_count: int
    average_daily_movement_percent: float
    most_active: List[StockGainerLoser]
    timestamp: str


# --- Stock & Analysis Schemas ---
class StockSearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    sector: Optional[str] = None
    country: Optional[str] = None

class StockQuote(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    current_price: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    previous_close: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    avg_volume: Optional[int] = None
    provider: Optional[str] = "Market Engine"
    last_updated: str

class HistoricalDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockHistoryResponse(BaseModel):
    symbol: str
    name: str
    currency: str
    period: str
    interval: str
    data: List[HistoricalDataPoint]

class IndicatorExplanation(BaseModel):
    signal: str  # "Bullish", "Bearish", "Neutral", "Overbought", "Oversold"
    summary: str
    description: str

class TechnicalIndicatorsResponse(BaseModel):
    symbol: str
    current_price: float
    timestamp: str
    indicators: Dict[str, Any]
    explanations: Dict[str, IndicatorExplanation]
    insights: List[str]
    support_resistance: Dict[str, float]


# --- AI Prediction Schemas ---
class PredictionRequest(BaseModel):
    symbol: str
    period: str = Field("2y", description="Training historical period e.g. 1y, 2y, 5y")
    horizon: str = Field("7d", description="Forecast horizon: 1d, 7d, 30d")
    model_type: Optional[str] = Field("random_forest", description="random_forest, gradient_boosting, or linear_baseline")

class ModelMetrics(BaseModel):
    mae: float
    rmse: float
    mape: float
    directional_accuracy_percent: float
    baseline_mae: float
    baseline_mape: float
    r2_score: float

class PredictedPoint(BaseModel):
    date: str
    price: float
    confidence_lower: float
    confidence_upper: float

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    symbol: str
    name: str
    current_price: float
    predicted_price: float
    expected_change: float
    expected_change_percent: float
    trend: str  # "Bullish", "Bearish", "Neutral"
    prediction_horizon: str
    model_name: str
    metrics: ModelMetrics
    features_used: List[str]
    historical_chart: List[HistoricalDataPoint]
    forecast_points: List[PredictedPoint]
    confidence_interval: Dict[str, float]
    disclaimer: str
    generated_at: str

class SavedPredictionResponse(BaseModel):
    id: int
    stock_symbol: str
    company_name: Optional[str]
    prediction_horizon: str
    current_price: float
    predicted_price: float
    expected_change_percent: float
    trend: str
    model_name: str
    metrics_json: Optional[str]
    confidence_lower: Optional[float]
    confidence_upper: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Watchlist Schemas ---
class WatchlistItemCreate(BaseModel):
    stock_symbol: str
    company_name: Optional[str] = None
    exchange: Optional[str] = None

class WatchlistItemResponse(BaseModel):
    id: int
    user_id: int
    stock_symbol: str
    company_name: Optional[str]
    exchange: Optional[str]
    created_at: datetime
    # Enriched live data
    quote: Optional[StockQuote] = None

    class Config:
        from_attributes = True


# --- Portfolio Schemas ---
class PortfolioItemCreate(BaseModel):
    stock_symbol: str
    company_name: Optional[str] = None
    purchase_price: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    purchase_date: str
    notes: Optional[str] = None

class PortfolioItemUpdate(BaseModel):
    purchase_price: Optional[float] = Field(None, gt=0)
    quantity: Optional[float] = Field(None, gt=0)
    purchase_date: Optional[str] = None
    notes: Optional[str] = None

class PortfolioItemResponse(BaseModel):
    id: int
    user_id: int
    stock_symbol: str
    company_name: Optional[str]
    purchase_price: float
    quantity: float
    purchase_date: str
    notes: Optional[str]
    created_at: datetime
    # Enriched live calculations
    current_price: float
    total_invested: float
    current_value: float
    total_profit_loss: float
    profit_loss_percent: float
    currency: str

    class Config:
        from_attributes = True

class PortfolioSummaryResponse(BaseModel):
    total_invested: float
    current_value: float
    total_profit_loss: float
    profit_loss_percent: float
    holdings_count: int
    top_performer: Optional[Dict[str, Any]] = None
    worst_performer: Optional[Dict[str, Any]] = None
    allocation: List[Dict[str, Any]]
    items: List[PortfolioItemResponse]


# --- News Schemas ---
class NewsArticle(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    summary: Optional[str] = None
    related_symbols: List[str] = []
    image_url: Optional[str] = None


# --- API Key Management & Live Provider Schemas ---
class ApiKeyConfig(BaseModel):
    twelve_data_api_key: Optional[str] = None
    finnhub_api_key: Optional[str] = None
    alpha_vantage_api_key: Optional[str] = None
    polygon_api_key: Optional[str] = None

class ApiKeyStatusResponse(BaseModel):
    twelve_data_configured: bool
    twelve_data_masked: str
    finnhub_configured: bool
    finnhub_masked: str
    alpha_vantage_configured: bool
    alpha_vantage_masked: str
    polygon_configured: bool
    polygon_masked: str
    active_provider: str
    message: str

class TestKeyRequest(BaseModel):
    provider: str  # "twelvedata", "finnhub", "alphavantage", "polygon"
    api_key: str
    symbol: Optional[str] = "AAPL"

class TestKeyResponse(BaseModel):
    success: bool
    message: str
    provider: str
    sample_quote: Optional[Dict[str, Any]] = None


