export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface IndexQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  current_value: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  open: number;
  previous_close: number;
  status: string;
  last_updated: string;
}

export interface StockGainerLoser {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  current_price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
}

export interface MarketStats {
  tracked_stocks_count: number;
  gainers_count: number;
  losers_count: number;
  neutral_count: number;
  average_daily_movement_percent: number;
  most_active: StockGainerLoser[];
  timestamp: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  sector?: string;
  country?: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  current_price: number;
  change: number;
  change_percent: number;
  open: number;
  high: number;
  low: number;
  previous_close: number;
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  provider?: string;
  last_updated: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistoryResponse {
  symbol: string;
  name: string;
  currency: string;
  period: string;
  interval: string;
  data: HistoricalDataPoint[];
}

export interface IndicatorExplanation {
  signal: string;
  summary: string;
  description: string;
}

export interface TechnicalIndicatorsResponse {
  symbol: string;
  current_price: number;
  timestamp: string;
  indicators: {
    sma_20: number;
    sma_50: number;
    sma_200: number;
    ema_12: number;
    ema_26: number;
    rsi_14: number;
    macd_line: number;
    macd_signal: number;
    macd_histogram: number;
    bollinger_upper: number;
    bollinger_middle: number;
    bollinger_lower: number;
    bollinger_width_percent: number;
    annualized_volatility_percent: number;
  };
  explanations: {
    rsi: IndicatorExplanation;
    moving_averages: IndicatorExplanation;
    macd: IndicatorExplanation;
    bollinger: IndicatorExplanation;
  };
  insights: string[];
  support_resistance: {
    pivot: number;
    resistance_1: number;
    resistance_swing_high: number;
    support_1: number;
    support_swing_low: number;
  };
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  mape: number;
  directional_accuracy_percent: number;
  baseline_mae: number;
  baseline_mape: number;
  r2_score: number;
}

export interface PredictedPoint {
  date: string;
  price: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface PredictionResponse {
  id?: number;
  symbol: string;
  name: string;
  current_price: number;
  predicted_price: number;
  expected_change: number;
  expected_change_percent: number;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  prediction_horizon: string;
  model_name: string;
  metrics: ModelMetrics;
  features_used: string[];
  historical_chart: HistoricalDataPoint[];
  forecast_points: PredictedPoint[];
  confidence_interval: {
    lower_bound: number;
    upper_bound: number;
    residual_std: number;
  };
  disclaimer: string;
  generated_at: string;
}

export interface WatchlistItem {
  id: number;
  user_id: number;
  stock_symbol: string;
  company_name?: string;
  exchange?: string;
  created_at: string;
  quote?: StockQuote;
}

export interface PortfolioItem {
  id: number;
  user_id: number;
  stock_symbol: string;
  company_name?: string;
  purchase_price: number;
  quantity: number;
  purchase_date: string;
  notes?: string;
  created_at: string;
  current_price: number;
  total_invested: number;
  current_value: number;
  total_profit_loss: number;
  profit_loss_percent: number;
  currency: string;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_profit_loss: number;
  profit_loss_percent: number;
  holdings_count: number;
  top_performer?: {
    symbol: string;
    company_name?: string;
    profit_loss_percent: number;
  };
  worst_performer?: {
    symbol: string;
    company_name?: string;
    profit_loss_percent: number;
  };
  allocation: {
    symbol: string;
    name?: string;
    value: number;
    percent: number;
  }[];
  items: PortfolioItem[];
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  published_at: string;
  summary?: string;
  related_symbols: string[];
  image_url?: string;
}

export interface ApiKeyStatusResponse {
  twelve_data_configured: boolean;
  twelve_data_masked: string;
  finnhub_configured: boolean;
  finnhub_masked: string;
  alpha_vantage_configured: boolean;
  alpha_vantage_masked: string;
  polygon_configured: boolean;
  polygon_masked: string;
  active_provider: string;
  message: string;
}

export interface TestKeyResponse {
  success: boolean;
  message: string;
  provider: string;
  sample_quote?: any;
}

