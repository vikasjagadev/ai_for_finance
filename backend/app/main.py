import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.database import Base, engine, SessionLocal
from app.models.models import User, Watchlist, Portfolio
from app.utils.security import hash_password
from app.api import auth, market, stocks, predictions, watchlist, portfolio, news, settings as settings_api

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="StockMind AI - Advanced Stock Market Analysis and Machine Learning Prediction Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local development and external preview origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(stocks.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(watchlist.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")

@app.on_event("startup")
def init_seed_data():
    """
    Seeds initial demo account with sample portfolio and watchlist
    so the dashboard is instantly active and exploratory out-of-the-box.
    """
    db = SessionLocal()
    try:
        demo_email = "demo@stockmind.ai"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                name="Professional Investor",
                email=demo_email,
                hashed_password=hash_password("password123")
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Seed demo watchlist
            initial_watchlist = [
                {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE"},
                {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE"},
                {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
                {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
            ]
            for w in initial_watchlist:
                db.add(Watchlist(
                    user_id=user.id,
                    stock_symbol=w["symbol"],
                    company_name=w["name"],
                    exchange=w["exchange"]
                ))

            # Seed demo portfolio holdings
            initial_portfolio = [
                {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "price": 1240.0, "qty": 50, "date": "2025-08-15"},
                {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": 115.5, "qty": 30, "date": "2025-09-01"},
                {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "price": 3820.0, "qty": 20, "date": "2025-10-10"},
                {"symbol": "AAPL", "name": "Apple Inc.", "price": 210.0, "qty": 25, "date": "2025-11-05"},
            ]
            for p in initial_portfolio:
                db.add(Portfolio(
                    user_id=user.id,
                    stock_symbol=p["symbol"],
                    company_name=p["name"],
                    purchase_price=p["price"],
                    quantity=p["qty"],
                    purchase_date=p["date"],
                    notes="Core long-term investment holding"
                ))

            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seed initialization notice: {e}")
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)

