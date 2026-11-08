import datetime
import time
from typing import List, Dict, Any, Optional
import pandas as pd
import httpx
import yfinance as yf
from app.config import settings
from app.schemas.schemas import (
    IndexQuote, MarketOverviewResponse, StockGainerLoser, 
    MarketStatsResponse, StockSearchResult, StockQuote, 
    HistoricalDataPoint, StockHistoryResponse
)

# In-memory Cache storage: {cache_key: {"timestamp": float, "data": Any}}
CACHE: Dict[str, Dict[str, Any]] = {}

def get_cached(key: str, ttl_seconds: int = 60) -> Optional[Any]:
    if key in CACHE:
        entry = CACHE[key]
        if time.time() - entry["timestamp"] < ttl_seconds:
            return entry["data"]
    return None

def set_cached(key: str, data: Any):
    CACHE[key] = {
        "timestamp": time.time(),
        "data": data
    }

# Curated high-relevance search universe covering Indian NSE/BSE and US tech & blue chips
STOCK_UNIVERSE = [
    # Indian NSE / BSE Blue Chips
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE", "currency": "INR", "sector": "Energy / Conglomerate", "country": "India"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE", "currency": "INR", "sector": "Information Technology", "country": "India"},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "exchange": "NSE", "currency": "INR", "sector": "Information Technology", "country": "India"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "exchange": "NSE", "currency": "INR", "sector": "Banking & Financials", "country": "India"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "exchange": "NSE", "currency": "INR", "sector": "Banking & Financials", "country": "India"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "exchange": "NSE", "currency": "INR", "sector": "Automobile", "country": "India"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE", "currency": "INR", "sector": "Public Sector Banking", "country": "India"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd", "exchange": "NSE", "currency": "INR", "sector": "Telecommunications", "country": "India"},
    {"symbol": "ITC.NS", "name": "ITC Ltd", "exchange": "NSE", "currency": "INR", "sector": "FMCG / Tobacco", "country": "India"},
    {"symbol": "LICI.NS", "name": "Life Insurance Corp of India", "exchange": "NSE", "currency": "INR", "sector": "Insurance", "country": "India"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro Ltd", "exchange": "NSE", "currency": "INR", "sector": "Infrastructure & Engineering", "country": "India"},
    {"symbol": "WIPRO.NS", "name": "Wipro Ltd", "exchange": "NSE", "currency": "INR", "sector": "Information Technology", "country": "India"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance Ltd", "exchange": "NSE", "currency": "INR", "sector": "Financial Services", "country": "India"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd", "exchange": "NSE", "currency": "INR", "sector": "Consumer Goods", "country": "India"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki India", "exchange": "NSE", "currency": "INR", "sector": "Automobile", "country": "India"},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical Industries", "exchange": "NSE", "currency": "INR", "sector": "Pharmaceuticals", "country": "India"},
    {"symbol": "ADANIENT.NS", "name": "Adani Enterprises Ltd", "exchange": "NSE", "currency": "INR", "sector": "Conglomerate", "country": "India"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "exchange": "NSE", "currency": "INR", "sector": "Banking", "country": "India"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank Ltd", "exchange": "NSE", "currency": "INR", "sector": "Banking", "country": "India"},
    {"symbol": "TITAN.NS", "name": "Titan Company Ltd", "exchange": "NSE", "currency": "INR", "sector": "Consumer Discretionary", "country": "India"},

    # US Major Leaders
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "currency": "USD", "sector": "Consumer Electronics", "country": "United States"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "currency": "USD", "sector": "Software & Cloud", "country": "United States"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "currency": "USD", "sector": "Semiconductors & AI", "country": "United States"},
    {"symbol": "GOOGL", "name": "Alphabet Inc. (Google)", "exchange": "NASDAQ", "currency": "USD", "sector": "Internet & Search", "country": "United States"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ", "currency": "USD", "sector": "E-Commerce & Cloud", "country": "United States"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ", "currency": "NASDAQ", "currency": "USD", "sector": "EV & Robotics", "country": "United States"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ", "currency": "USD", "sector": "Social Media & VR", "country": "United States"},
    {"symbol": "AMD", "name": "Advanced Micro Devices", "exchange": "NASDAQ", "currency": "USD", "sector": "Semiconductors", "country": "United States"},
    {"symbol": "BRK-B", "name": "Berkshire Hathaway", "exchange": "NYSE", "currency": "USD", "sector": "Financial Holding", "country": "United States"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE", "currency": "USD", "sector": "Banking", "country": "United States"},
    {"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE", "currency": "USD", "sector": "Payments", "country": "United States"},
    {"symbol": "PLTR", "name": "Palantir Technologies Inc.", "exchange": "NYSE", "currency": "USD", "sector": "AI Software", "country": "United States"},
]

TRACKED_MOVER_SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "TATAMOTORS.NS", 
    "ICICIBANK.NS", "SBIN.NS", "AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META"
]

INDEX_CONFIGS = [
    {"symbol": "^NSEI", "name": "NIFTY 50", "exchange": "NSE", "currency": "INR"},
    {"symbol": "^BSESN", "name": "SENSEX", "exchange": "BSE", "currency": "INR"},
    {"symbol": "^NSEBANK", "name": "BANK NIFTY", "exchange": "NSE", "currency": "INR"},
    {"symbol": "^IXIC", "name": "NASDAQ", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "^GSPC", "name": "S&P 500", "exchange": "S&P", "currency": "USD"},
]

class MarketDataService:

    @staticmethod
    def get_market_overview() -> MarketOverviewResponse:
        cache_key = "market_overview"
        cached = get_cached(cache_key, ttl_seconds=45)
        if cached:
            return cached

        indices: List[IndexQuote] = []
        now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        for cfg in INDEX_CONFIGS:
            sym = cfg["symbol"]
            try:
                ticker = yf.Ticker(sym)
                fi = ticker.fast_info
                
                # Fetch recent history for accurate previous close and high/low
                hist = ticker.history(period="2d")
                if not hist.empty:
                    current_price = float(hist["Close"].iloc[-1])
                    prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else float(hist["Open"].iloc[-1])
                    day_open = float(hist["Open"].iloc[-1])
                    day_high = float(hist["High"].iloc[-1])
                    day_low = float(hist["Low"].iloc[-1])
                else:
                    current_price = float(getattr(fi, "last_price", 0.0) or 0.0)
                    prev_close = float(getattr(fi, "previous_close", current_price) or current_price)
                    day_open = float(getattr(fi, "open", current_price) or current_price)
                    day_high = float(getattr(fi, "day_high", current_price) or current_price)
                    day_low = float(getattr(fi, "day_low", current_price) or current_price)

                change = round(current_price - prev_close, 2)
                change_pct = round((change / prev_close) * 100, 2) if prev_close else 0.0

                indices.append(IndexQuote(
                    symbol=sym,
                    name=cfg["name"],
                    exchange=cfg["exchange"],
                    currency=cfg["currency"],
                    current_value=round(current_price, 2),
                    change=change,
                    change_percent=change_pct,
                    high=round(day_high, 2),
                    low=round(day_low, 2),
                    open=round(day_open, 2),
                    previous_close=round(prev_close, 2),
                    status="Active",
                    last_updated=now_iso
                ))
            except Exception as e:
                # Fallback gracefully
                indices.append(IndexQuote(
                    symbol=sym,
                    name=cfg["name"],
                    exchange=cfg["exchange"],
                    currency=cfg["currency"],
                    current_value=0.0,
                    change=0.0,
                    change_percent=0.0,
                    high=0.0,
                    low=0.0,
                    open=0.0,
                    previous_close=0.0,
                    status="Delayed",
                    last_updated=now_iso
                ))

        res = MarketOverviewResponse(indices=indices, timestamp=now_iso)
        set_cached(cache_key, res)
        return res

    @staticmethod
    def get_market_stats_and_movers() -> Dict[str, Any]:
        cache_key = "market_movers_and_stats"
        cached = get_cached(cache_key, ttl_seconds=60)
        if cached:
            return cached

        items: List[StockGainerLoser] = []
        now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # Map symbol metadata
        meta_map = {item["symbol"]: item for item in STOCK_UNIVERSE}

        for sym in TRACKED_MOVER_SYMBOLS:
            meta = meta_map.get(sym, {"name": sym, "exchange": "NSE" if ".NS" in sym else "US", "currency": "INR" if ".NS" in sym else "USD"})
            try:
                t = yf.Ticker(sym)
                fi = t.fast_info
                last_price = float(getattr(fi, "last_price", 0.0) or 0.0)
                prev_close = float(getattr(fi, "previous_close", last_price) or last_price)
                vol = int(getattr(fi, "last_volume", 0) or 0)
                mkt_cap = getattr(fi, "market_cap", None)

                if last_price > 0 and prev_close > 0:
                    chg = round(last_price - prev_close, 2)
                    chg_pct = round((chg / prev_close) * 100, 2)
                else:
                    chg = 0.0
                    chg_pct = 0.0

                items.append(StockGainerLoser(
                    symbol=sym,
                    name=meta["name"],
                    exchange=meta["exchange"],
                    currency=meta["currency"],
                    current_price=round(last_price, 2),
                    change=chg,
                    change_percent=chg_pct,
                    volume=vol,
                    market_cap=mkt_cap
                ))
            except Exception:
                continue

        # Sort for gainers, losers, and most active
        gainers = sorted([x for x in items if x.change_percent >= 0], key=lambda x: x.change_percent, reverse=True)
        losers = sorted([x for x in items if x.change_percent < 0], key=lambda x: x.change_percent)
        most_active = sorted(items, key=lambda x: x.volume, reverse=True)[:5]

        avg_movement = round(sum(abs(x.change_percent) for x in items) / len(items), 2) if items else 0.0

        stats = MarketStatsResponse(
            tracked_stocks_count=len(STOCK_UNIVERSE),
            gainers_count=len(gainers),
            losers_count=len(losers),
            neutral_count=len([x for x in items if x.change_percent == 0]),
            average_daily_movement_percent=avg_movement,
            most_active=most_active,
            timestamp=now_iso
        )

        result = {
            "stats": stats,
            "gainers": gainers[:8],
            "losers": losers[:8]
        }
        set_cached(cache_key, result)
        return result

    @staticmethod
    def search_stocks(query: str) -> List[StockSearchResult]:
        q = query.strip().upper()
        if not q:
            # Return top 10 universe stocks as recommendation
            return [StockSearchResult(**x) for x in STOCK_UNIVERSE[:10]]

        matches = []
        # First match curated list
        for item in STOCK_UNIVERSE:
            if q in item["symbol"].upper() or q in item["name"].upper():
                matches.append(StockSearchResult(**item))

        # If user typed something specific not yet in universe, attempt real yfinance validation
        if len(matches) < 3 and len(q) >= 2:
            try:
                candidate_symbol = q if "." in q or q.isalpha() else f"{q}.NS"
                test_ticker = yf.Ticker(candidate_symbol)
                fi = test_ticker.fast_info
                price = getattr(fi, "last_price", None)
                if price and price > 0:
                    exchange = "NSE" if ".NS" in candidate_symbol else "BSE" if ".BO" in candidate_symbol else "US"
                    currency = "INR" if ".NS" in candidate_symbol or ".BO" in candidate_symbol else "USD"
                    matches.append(StockSearchResult(
                        symbol=candidate_symbol,
                        name=f"{candidate_symbol} Market Asset",
                        exchange=exchange,
                        currency=currency,
                        sector="Equity",
                        country="India" if currency == "INR" else "Global"
                    ))
            except Exception:
                pass

        return matches[:15]

    @staticmethod
    def _fetch_twelve_data_quote(clean_symbol: str, api_key: str) -> Optional[StockQuote]:
        try:
            if clean_symbol.endswith(".NS"):
                base_sym = clean_symbol.replace(".NS", "")
                url = f"https://api.twelvedata.com/quote?symbol={base_sym}&exchange=NSE&apikey={api_key}"
                exchange = "NSE"
                currency = "INR"
            elif clean_symbol.endswith(".BO"):
                base_sym = clean_symbol.replace(".BO", "")
                url = f"https://api.twelvedata.com/quote?symbol={base_sym}&exchange=BSE&apikey={api_key}"
                exchange = "BSE"
                currency = "INR"
            else:
                url = f"https://api.twelvedata.com/quote?symbol={clean_symbol}&apikey={api_key}"
                exchange = "NASDAQ" if clean_symbol in ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "META"] else "US"
                currency = "USD"

            resp = httpx.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                if "close" in data and data.get("status") != "error":
                    cur_price = float(data.get("close") or data.get("price") or 0.0)
                    if cur_price > 0:
                        prev_close = float(data.get("previous_close") or cur_price)
                        change = float(data.get("change") or round(cur_price - prev_close, 2))
                        chg_pct = float(data.get("percent_change") or (round((change / prev_close) * 100, 2) if prev_close else 0.0))
                        day_open = float(data.get("open") or cur_price)
                        day_high = float(data.get("high") or cur_price)
                        day_low = float(data.get("low") or cur_price)
                        vol = int(data.get("volume") or 0)
                        fifty_two = data.get("fifty_two_week", {})
                        fifty_two_high = float(fifty_two.get("high")) if fifty_two and fifty_two.get("high") else None
                        fifty_two_low = float(fifty_two.get("low")) if fifty_two and fifty_two.get("low") else None

                        meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
                        name = data.get("name") or (meta["name"] if meta else clean_symbol)
                        now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

                        return StockQuote(
                            symbol=clean_symbol,
                            name=name,
                            exchange=exchange,
                            currency=currency,
                            current_price=round(cur_price, 2),
                            change=round(change, 2),
                            change_percent=round(chg_pct, 2),
                            open=round(day_open, 2),
                            high=round(day_high, 2),
                            low=round(day_low, 2),
                            previous_close=round(prev_close, 2),
                            volume=vol,
                            fifty_two_week_high=fifty_two_high,
                            fifty_two_week_low=fifty_two_low,
                            provider="Twelve Data (Live API)",
                            last_updated=now_iso
                        )
        except Exception:
            pass
        return None

    @staticmethod
    def _fetch_finnhub_quote(clean_symbol: str, api_key: str) -> Optional[StockQuote]:
        try:
            url = f"https://finnhub.io/api/v1/quote?symbol={clean_symbol}&token={api_key}"
            resp = httpx.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                cur_price = float(data.get("c") or 0.0)
                if cur_price > 0:
                    prev_close = float(data.get("pc") or cur_price)
                    change = float(data.get("d") or round(cur_price - prev_close, 2))
                    chg_pct = float(data.get("dp") or (round((change / prev_close) * 100, 2) if prev_close else 0.0))
                    day_open = float(data.get("o") or cur_price)
                    day_high = float(data.get("h") or cur_price)
                    day_low = float(data.get("l") or cur_price)

                    meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
                    name = meta["name"] if meta else clean_symbol
                    now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

                    return StockQuote(
                        symbol=clean_symbol,
                        name=name,
                        exchange="US",
                        currency="USD",
                        current_price=round(cur_price, 2),
                        change=round(change, 2),
                        change_percent=round(chg_pct, 2),
                        open=round(day_open, 2),
                        high=round(day_high, 2),
                        low=round(day_low, 2),
                        previous_close=round(prev_close, 2),
                        volume=0,
                        provider="Finnhub (Real-time Live API)",
                        last_updated=now_iso
                    )
        except Exception:
            pass
        return None

    @staticmethod
    def _fetch_alpha_vantage_quote(clean_symbol: str, api_key: str) -> Optional[StockQuote]:
        try:
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={clean_symbol}&apikey={api_key}"
            resp = httpx.get(url, timeout=6.0)
            if resp.status_code == 200:
                data = resp.json()
                gq = data.get("Global Quote", {})
                if "05. price" in gq:
                    cur_price = float(gq["05. price"])
                    prev_close = float(gq.get("08. previous close", cur_price))
                    change = float(gq.get("09. change", cur_price - prev_close))
                    chg_pct_str = gq.get("10. change percent", "0%").replace("%", "")
                    chg_pct = float(chg_pct_str) if chg_pct_str else 0.0
                    day_open = float(gq.get("02. open", cur_price))
                    day_high = float(gq.get("03. high", cur_price))
                    day_low = float(gq.get("04. low", cur_price))
                    vol = int(gq.get("06. volume", 0))

                    meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
                    name = meta["name"] if meta else clean_symbol
                    now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

                    return StockQuote(
                        symbol=clean_symbol,
                        name=name,
                        exchange="US",
                        currency="USD",
                        current_price=round(cur_price, 2),
                        change=round(change, 2),
                        change_percent=round(chg_pct, 2),
                        open=round(day_open, 2),
                        high=round(day_high, 2),
                        low=round(day_low, 2),
                        previous_close=round(prev_close, 2),
                        volume=vol,
                        provider="Alpha Vantage (Live API)",
                        last_updated=now_iso
                    )
        except Exception:
            pass
        return None

    @staticmethod
    def test_api_key(provider: str, api_key: str, symbol: str = "AAPL") -> Dict[str, Any]:
        prov = provider.lower().replace("-", "").replace("_", "").replace(" ", "")
        sym = symbol.strip().upper()

        if not api_key or not api_key.strip():
            return {"success": False, "provider": provider, "message": "API key cannot be empty."}

        try:
            if "twelve" in prov:
                quote = MarketDataService._fetch_twelve_data_quote(sym, api_key.strip())
                if quote:
                    return {
                        "success": True,
                        "provider": "Twelve Data",
                        "message": f"Successfully authenticated with Twelve Data! Live quote received for {sym}.",
                        "sample_quote": quote.model_dump()
                    }
                else:
                    return {
                        "success": False,
                        "provider": "Twelve Data",
                        "message": "Twelve Data rejected the API key or returned an error. Please verify the key at twelvedata.com."
                    }

            elif "finnhub" in prov:
                quote = MarketDataService._fetch_finnhub_quote(sym, api_key.strip())
                if quote:
                    return {
                        "success": True,
                        "provider": "Finnhub",
                        "message": f"Successfully authenticated with Finnhub! Real-time quote received for {sym}.",
                        "sample_quote": quote.model_dump()
                    }
                else:
                    return {
                        "success": False,
                        "provider": "Finnhub",
                        "message": "Finnhub API key was rejected or returned 0 price. Please check your token at finnhub.io."
                    }

            elif "alpha" in prov:
                quote = MarketDataService._fetch_alpha_vantage_quote(sym, api_key.strip())
                if quote:
                    return {
                        "success": True,
                        "provider": "Alpha Vantage",
                        "message": f"Successfully authenticated with Alpha Vantage! Global quote received for {sym}.",
                        "sample_quote": quote.model_dump()
                    }
                else:
                    return {
                        "success": False,
                        "provider": "Alpha Vantage",
                        "message": "Alpha Vantage rejected the key or exceeded the free tier rate limit. Check alphavantage.co."
                    }
            else:
                return {
                    "success": False,
                    "provider": provider,
                    "message": f"Unknown provider '{provider}'. Supported: Twelve Data, Finnhub, Alpha Vantage."
                }
        except Exception as e:
            return {
                "success": False,
                "provider": provider,
                "message": f"Connection test failed: {str(e)}"
            }

    @staticmethod
    def get_stock_quote(symbol: str) -> StockQuote:
        clean_symbol = symbol.strip().upper()
        cache_key = f"quote_{clean_symbol}"
        cached = get_cached(cache_key, ttl_seconds=30)
        if cached:
            return cached

        # 1. Prioritize configured Live API providers
        if settings.TWELVE_DATA_API_KEY:
            td_quote = MarketDataService._fetch_twelve_data_quote(clean_symbol, settings.TWELVE_DATA_API_KEY)
            if td_quote:
                set_cached(cache_key, td_quote)
                return td_quote

        if settings.FINNHUB_API_KEY and not clean_symbol.endswith((".NS", ".BO")):
            fh_quote = MarketDataService._fetch_finnhub_quote(clean_symbol, settings.FINNHUB_API_KEY)
            if fh_quote:
                set_cached(cache_key, fh_quote)
                return fh_quote

        if settings.ALPHA_VANTAGE_API_KEY:
            av_quote = MarketDataService._fetch_alpha_vantage_quote(clean_symbol, settings.ALPHA_VANTAGE_API_KEY)
            if av_quote:
                set_cached(cache_key, av_quote)
                return av_quote

        # 2. Resilient base market engine
        ticker = yf.Ticker(clean_symbol)
        fi = ticker.fast_info

        # Find matching metadata or deduce
        meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
        name = meta["name"] if meta else clean_symbol
        exchange = meta["exchange"] if meta else ("NSE" if ".NS" in clean_symbol else "BSE" if ".BO" in clean_symbol else "US")
        currency = meta["currency"] if meta else ("INR" if ".NS" in clean_symbol or ".BO" in clean_symbol else "USD")

        # Fetch recent 2-day history for high/low/close precision
        hist = ticker.history(period="2d")
        if not hist.empty:
            current_price = float(hist["Close"].iloc[-1])
            prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else float(hist["Open"].iloc[-1])
            day_open = float(hist["Open"].iloc[-1])
            day_high = float(hist["High"].iloc[-1])
            day_low = float(hist["Low"].iloc[-1])
            vol = int(hist["Volume"].iloc[-1])
        else:
            current_price = float(getattr(fi, "last_price", 0.0) or 0.0)
            prev_close = float(getattr(fi, "previous_close", current_price) or current_price)
            day_open = float(getattr(fi, "open", current_price) or current_price)
            day_high = float(getattr(fi, "day_high", current_price) or current_price)
            day_low = float(getattr(fi, "day_low", current_price) or current_price)
            vol = int(getattr(fi, "last_volume", 0) or 0)

        change = round(current_price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0.0

        mkt_cap = getattr(fi, "market_cap", None)
        fifty_two_high = getattr(fi, "year_high", day_high)
        fifty_two_low = getattr(fi, "year_low", day_low)

        now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        quote = StockQuote(
            symbol=clean_symbol,
            name=name,
            exchange=exchange,
            currency=currency,
            current_price=round(current_price, 2),
            change=change,
            change_percent=change_pct,
            open=round(day_open, 2),
            high=round(day_high, 2),
            low=round(day_low, 2),
            previous_close=round(prev_close, 2),
            volume=vol,
            market_cap=mkt_cap,
            fifty_two_week_high=round(fifty_two_high, 2) if fifty_two_high else None,
            fifty_two_week_low=round(fifty_two_low, 2) if fifty_two_low else None,
            provider="Market Engine (Real-Time)",
            last_updated=now_iso
        )

        set_cached(cache_key, quote)
        return quote

    @staticmethod
    def get_stock_history(symbol: str, period: str = "1y", interval: str = "1d") -> StockHistoryResponse:
        clean_symbol = symbol.strip().upper()
        cache_key = f"hist_{clean_symbol}_{period}_{interval}"
        cached = get_cached(cache_key, ttl_seconds=300)
        if cached:
            return cached

        ticker = yf.Ticker(clean_symbol)
        hist = ticker.history(period=period, interval=interval)

        if hist.empty:
            # Fallback to 6m if 1y was empty or symbol syntax issue
            hist = ticker.history(period="6mo", interval="1d")

        data_points: List[HistoricalDataPoint] = []
        for index, row in hist.iterrows():
            date_str = index.strftime("%Y-%m-%d") if hasattr(index, "strftime") else str(index)[:10]
            data_points.append(HistoricalDataPoint(
                date=date_str,
                open=round(float(row["Open"]), 2),
                high=round(float(row["High"]), 2),
                low=round(float(row["Low"]), 2),
                close=round(float(row["Close"]), 2),
                volume=int(row["Volume"]) if "Volume" in row and not pd.isna(row["Volume"]) else 0
            ))

        meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
        name = meta["name"] if meta else clean_symbol
        currency = meta["currency"] if meta else ("INR" if ".NS" in clean_symbol else "USD")

        res = StockHistoryResponse(
            symbol=clean_symbol,
            name=name,
            currency=currency,
            period=period,
            interval=interval,
            data=data_points
        )
        set_cached(cache_key, res)
        return res
