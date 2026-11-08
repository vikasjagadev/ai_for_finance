# 🚀 StockMind AI: AI-Powered Stock Market Analysis & Prediction System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=TypeScript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0+-06B6D4.svg?style=flat&logo=TailwindCSS&logoColor=white)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5+-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An institutional-grade, responsive, full-stack financial technology web application designed to analyze multi-exchange stock market trends, interpret algorithmic technical indicators, and generate empirical machine learning predictions with out-of-sample uncertainty bounds.

---

## 🌟 Key Features

### 1. Market Intelligence Dashboard
- **Real-Time Indices Surveillance**: Tracks Indian NSE/BSE and US Global indices:
  - **NIFTY 50** (`^NSEI`, NSE, INR)
  - **SENSEX** (`^BSESN`, BSE, INR)
  - **BANK NIFTY** (`^NSEBANK`, NSE, INR)
  - **NASDAQ Composite** (`^IXIC`, NASDAQ, USD)
  - **S&P 500** (`^GSPC`, S&P, USD)
- **Market Breadth & Movers**: Gainers, losers, most active equities, and average daily volatility.
- **Interactive Multi-Timeframe Charting**: Candlestick/Area/Line views with 1D, 1W, 1M, 6M, 1Y, and 5Y timeframe filters, volume histograms, and dynamic moving average overlays (SMA 20, SMA 50).
- **Persistent Watchlist**: Pin, monitor, and remove equities with instant live price synchronization.

### 2. Deep Technical Analysis
- **17+ Algorithmic Indicators**:
  - Simple Moving Averages: SMA 20, SMA 50, SMA 200
  - Exponential Moving Averages: EMA 12, EMA 26
  - Relative Strength Index: 14-period RSI with overbought/oversold regime detection
  - MACD: MACD Line, 9-Day Signal Line, and Momentum Histogram
  - Bollinger Bands: 20-period dynamic corridor (Upper, Middle, Lower) & bandwidth %
  - Support & Resistance Mapping: Pivot point, Resistance 1 (R1), Support 1 (S1), 60-day swing highs and lows
- **Plain-English Explanations**: Accessible interpretations explaining exact institutional implications of every indicator.

### 3. Rigorous AI/ML Prediction Engine
- **No Synthetic or Random Predictions**: Models train exclusively on actual historical price action.
- **Strict Chronological Train/Test Split**: Prevents temporal lookahead bias and data leakage. Feature scaling parameters are fit strictly on the training partition.
- **Feature Engineering Vector**:
  - Return momentum (1d, 3d, 5d, 10d)
  - Lagged closing prices (t-1, t-2, t-3, t-5)
  - Rolling moving averages (5, 10, 20, 50 SMA) and price-to-SMA ratios
  - High-Low and Close-Open spreads
  - Rolling 10d and 20d volatility
  - Relative volume trend and technical momentum signals
- **Model Architectures**:
  - Random Forest Regressor (Ensemble non-linear learning)
  - Gradient Boosting Regressor (Iterative residual reduction)
  - Ridge Linear Baseline (Regularized linear benchmark)
- **Empirical Uncertainty & Confidence Bands**: 95% empirical forecast corridor derived from out-of-sample residual variance.
- **Comprehensive Evaluation**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Mean Absolute Percentage Error (MAPE), Directional Accuracy %, compared directly against a naïve persistence baseline ($y_{t+h} = y_t$).

### 4. Portfolio Performance Tracker
- **Mark-to-Market Evaluation**: Real-time asset valuation across Indian and US stocks.
- **Cost Basis & Performance**: Individual purchase price, quantity, nominal profit/loss, and percentage return.
- **Asset Allocation Breakdown**: Visual asset concentration distribution.
- **Pre-Seeded Demo Account**: Explore instantly with pre-populated holdings and watchlists.

### 5. News Wire & Global Updates
- Real-time headline feed parsed from verified financial wires and RSS feeds.
- Filter stories by target ticker or browse general macro coverage.
- Honest empty states if external feeds are unavailable (never fabricates news).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Framer Motion |
| **Backend** | Python 3.13, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy |
| **AI / ML** | Scikit-Learn, Pandas, NumPy, SciPy |
| **Data Ingestion** | `yfinance` (zero-config, high resilience), Yahoo RSS feeds, optional Finnhub / Alpha Vantage |
| **Database** | SQLite (default zero-config) / PostgreSQL / Supabase |
| **Authentication** | JWT (JSON Web Tokens), bcrypt password hashing, OAuth2 Bearer |

---

## 📂 Project Architecture

```
stockmind-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application entry & startup seeding
│   │   ├── config.py                   # Environment configuration & settings
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                 # Registration, login, profile endpoints
│   │   │   ├── market.py               # Indices overview, stats, gainers/losers
│   │   │   ├── stocks.py               # Ticker search, live quotes, technical indicators
│   │   │   ├── predictions.py          # AI prediction execution & history
│   │   │   ├── watchlist.py            # User watchlist CRUD
│   │   │   ├── portfolio.py            # Portfolio holdings & mark-to-market calculations
│   │   │   └── news.py                 # Financial news wire feed
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── models.py               # SQLAlchemy ORM models (User, Watchlist, Portfolio, Prediction)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py              # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── market_data.py          # Real-time multi-exchange market data service
│   │   │   ├── technical_analysis.py   # Mathematical indicator calculations & explanations
│   │   │   └── news_service.py         # Financial news ingestion & caching
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── features.py             # Quantitative feature engineering pipeline
│   │   │   ├── metrics.py              # Out-of-sample metrics (MAE, RMSE, MAPE, Directional)
│   │   │   └── predictor.py            # Machine learning training & forecasting engine
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── database.py             # Engine, session factory & dependency injection
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── security.py             # Bcrypt hashing & JWT token verification
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarketTape.tsx          # Real-time scrolling ticker tape
│   │   │   ├── Navbar.tsx              # Top navigation bar & global search trigger
│   │   │   ├── Sidebar.tsx             # Collapsible navigation drawer
│   │   │   ├── StockChart.tsx          # Recharts multi-timeframe interactive chart
│   │   │   ├── PredictionChart.tsx     # Historical vs AI trajectory & uncertainty band
│   │   │   └── StockSearchModal.tsx    # Ctrl+K global stock search modal
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Marketing, interactive demo & FAQ
│   │   │   ├── DashboardPage.tsx       # Indices, stats, featured charts & watchlist
│   │   │   ├── AnalysisPage.tsx        # Technical indicators & signal interpretations
│   │   │   ├── PredictionPage.tsx      # Core AI prediction workspace
│   │   │   ├── PortfolioPage.tsx       # Mark-to-market portfolio manager
│   │   │   ├── NewsPage.tsx            # Live financial wire feed
│   │   │   ├── SettingsPage.tsx        # Theme, preferences & profile
│   │   │   └── AuthModal.tsx           # Sign In / Sign Up modal
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # Global auth state & demo user login
│   │   │   └── ThemeContext.tsx        # Dark terminal / light mode controller
│   │   ├── services/
│   │   │   └── api.ts                  # REST API client
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces
│   │   ├── App.tsx                     # Main layout & router orchestration
│   │   ├── main.tsx
│   │   └── index.css                   # Tailwind v4 styles & glassmorphic themes
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## ⚡ Quick Start & Execution Guide

### 1. Prerequisites
- **Python**: Version 3.10 or higher (Python 3.13 tested)
- **Node.js**: Version 18.0 or higher (v24.15 tested)
- **npm**: Version 9.0 or higher

---

### 2. Backend Setup & Startup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   python -m pip install -r requirements.txt
   ```

4. Configure environment variables (a pre-configured `.env` is already created):
   ```bash
   # If .env does not exist, copy from .env.example:
   cp .env.example .env
   ```

5. Launch the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The backend will be running at:
   - **API Base**: `http://localhost:8000`
   - **Interactive OpenAPI Docs**: `http://localhost:8000/docs`
   - **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 3. Frontend Setup & Startup

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 Pre-Seeded Demo Account

You do not need to register to test all features. The platform is pre-seeded with an active Demo Investor account:

- **Email**: `demo@stockmind.ai`
- **Password**: `password123`
- **One-Click Login**: Simply click the **"Demo Mode"** button in the top navigation bar or the **"One-Click Demo Account Login"** button in the sign-in modal.

---

## 📡 Sample REST API Requests

### 1. Health Status
```bash
curl -X GET "http://localhost:8000/api/health"
```

### 2. Market Overview (NIFTY 50, SENSEX, NASDAQ, S&P 500)
```bash
curl -X GET "http://localhost:8000/api/market/overview"
```

### 3. Stock Search
```bash
curl -X GET "http://localhost:8000/api/stocks/search?q=RELIANCE"
```

### 4. Technical Indicators
```bash
curl -X GET "http://localhost:8000/api/stocks/NVDA/indicators"
```

### 5. Execute Machine Learning Prediction
```bash
curl -X POST "http://localhost:8000/api/predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "period": "2y",
    "horizon": "7d",
    "model_type": "random_forest"
  }'
```

---

## 🗄️ Database Schema & Supabase Configuration

The application uses SQLAlchemy with automatic table creation upon startup.

### Schema Structure:
- `users`: User identity, hashed passwords, creation timestamps.
- `watchlists`: User-pinned stock symbols with live quote enrichment.
- `portfolio`: Holdings tracking symbol, purchase price, quantity, execution date, notes.
- `predictions`: Stored prediction executions including forecasted price, model name, confidence bounds, and evaluation metrics JSON.

### Connecting to Supabase or External PostgreSQL:
To switch from local SQLite to Supabase or PostgreSQL, update `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 🛡️ Financial Disclaimer

> **IMPORTANT**: AI predictions generated by StockMind AI are statistical mathematical forecasts based on historical market patterns and quantitative technical indicators. They do **not** constitute financial, legal, or investment advice, nor do they guarantee future profit. Financial markets carry inherent risk of capital loss. Always conduct independent due diligence.

