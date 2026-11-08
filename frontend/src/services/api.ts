import {
  AuthResponse,
  IndexQuote,
  MarketStats,
  StockGainerLoser,
  StockSearchResult,
  StockQuote,
  StockHistoryResponse,
  TechnicalIndicatorsResponse,
  PredictionResponse,
  WatchlistItem,
  PortfolioSummary,
  PortfolioItem,
  NewsArticle,
  ApiKeyStatusResponse,
  TestKeyResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('stockmind_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data: AuthResponse = await res.json();
    localStorage.setItem('stockmind_token', data.access_token);
    localStorage.setItem('stockmind_user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid email or password' }));
      throw new Error(err.detail || 'Invalid email or password');
    }
    const data: AuthResponse = await res.json();
    localStorage.setItem('stockmind_token', data.access_token);
    localStorage.setItem('stockmind_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('stockmind_token');
    localStorage.removeItem('stockmind_user');
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  // Market Data
  async getMarketOverview(): Promise<{ indices: IndexQuote[]; timestamp: string }> {
    const res = await fetch(`${API_BASE_URL}/market/overview`);
    if (!res.ok) throw new Error('Failed to load market overview');
    return res.json();
  },

  async getMarketStats(): Promise<MarketStats> {
    const res = await fetch(`${API_BASE_URL}/market/stats`);
    if (!res.ok) throw new Error('Failed to load market statistics');
    return res.json();
  },

  async getTopGainers(): Promise<StockGainerLoser[]> {
    const res = await fetch(`${API_BASE_URL}/market/gainers`);
    if (!res.ok) throw new Error('Failed to load top gainers');
    return res.json();
  },

  async getTopLosers(): Promise<StockGainerLoser[]> {
    const res = await fetch(`${API_BASE_URL}/market/losers`);
    if (!res.ok) throw new Error('Failed to load top losers');
    return res.json();
  },

  // Stocks & Analysis
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const res = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/quote`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Quote unavailable' }));
      throw new Error(err.detail || 'Failed to load stock quote');
    }
    return res.json();
  },

  async getStockHistory(symbol: string, period = '1y', interval = '1d'): Promise<StockHistoryResponse> {
    const res = await fetch(
      `${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/history?period=${period}&interval=${interval}`
    );
    if (!res.ok) throw new Error('Failed to fetch historical chart data');
    return res.json();
  },

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicatorsResponse> {
    const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/indicators`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to calculate indicators' }));
      throw new Error(err.detail || 'Failed to calculate indicators');
    }
    return res.json();
  },

  // AI Prediction
  async createPrediction(
    symbol: string,
    period = '2y',
    horizon = '7d',
    modelType = 'random_forest'
  ): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE_URL}/predictions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        symbol,
        period,
        horizon,
        model_type: modelType,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'AI Prediction model failed' }));
      throw new Error(err.detail || 'Prediction model execution failed');
    }
    return res.json();
  },

  async getSavedPredictions(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/predictions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Watchlist
  async getWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch(`${API_BASE_URL}/watchlist`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return res.json();
  },

  async addToWatchlist(symbol: string, companyName?: string, exchange?: string): Promise<WatchlistItem> {
    const res = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        stock_symbol: symbol,
        company_name: companyName,
        exchange: exchange,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add to watchlist' }));
      throw new Error(err.detail || 'Failed to add to watchlist');
    }
    return res.json();
  },

  async removeFromWatchlist(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/watchlist/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove from watchlist');
  },

  // Portfolio
  async getPortfolio(): Promise<PortfolioSummary> {
    const res = await fetch(`${API_BASE_URL}/portfolio`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load portfolio');
    return res.json();
  },

  async addHolding(
    symbol: string,
    price: number,
    quantity: number,
    purchaseDate: string,
    notes?: string
  ): Promise<PortfolioItem> {
    const res = await fetch(`${API_BASE_URL}/portfolio`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        stock_symbol: symbol,
        purchase_price: price,
        quantity: quantity,
        purchase_date: purchaseDate,
        notes: notes,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add holding' }));
      throw new Error(err.detail || 'Failed to add portfolio holding');
    }
    return res.json();
  },

  async updateHolding(
    id: number,
    data: { purchase_price?: number; quantity?: number; purchase_date?: string; notes?: string }
  ): Promise<PortfolioItem> {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update position');
    return res.json();
  },

  async deleteHolding(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete holding');
  },

  // News
  async getNews(symbol?: string): Promise<NewsArticle[]> {
    const url = symbol ? `${API_BASE_URL}/news?symbol=${encodeURIComponent(symbol)}` : `${API_BASE_URL}/news`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
  },

  // API Key Management & Live Provider Status
  async getApiKeyStatus(): Promise<ApiKeyStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/settings/keys`);
    if (!res.ok) throw new Error('Failed to fetch API key status');
    return res.json();
  },

  async updateApiKeys(keys: {
    twelve_data_api_key?: string;
    finnhub_api_key?: string;
    alpha_vantage_api_key?: string;
    polygon_api_key?: string;
  }): Promise<ApiKeyStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/settings/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
    });
    if (!res.ok) throw new Error('Failed to update API keys');
    return res.json();
  },

  async testApiKey(provider: string, apiKey: string, symbol = 'AAPL'): Promise<TestKeyResponse> {
    const res = await fetch(`${API_BASE_URL}/settings/test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        api_key: apiKey,
        symbol,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Key verification failed' }));
      throw new Error(err.message || 'Key test failed');
    }
    return res.json();
  },
};

