import datetime
import time
import xml.etree.ElementTree as ET
import urllib.request
from typing import List, Optional
import httpx
from app.config import settings
from app.schemas.schemas import NewsArticle

NEWS_CACHE: dict = {}

class NewsService:

    @staticmethod
    def get_financial_news(symbol: Optional[str] = None) -> List[NewsArticle]:
        target_symbol = symbol.strip().upper() if symbol else "MARKET"
        cache_key = f"news_{target_symbol}"
        now_ts = time.time()

        if cache_key in NEWS_CACHE:
            cached_time, cached_data = NEWS_CACHE[cache_key]
            if now_ts - cached_time < 300:  # 5 minutes TTL
                return cached_data

        articles: List[NewsArticle] = []

        # 1. If Finnhub API key is configured, query Finnhub
        if settings.FINNHUB_API_KEY:
            try:
                if symbol:
                    url = f"https://finnhub.io/api/v1/company-news?symbol={target_symbol}&from={(datetime.datetime.now() - datetime.timedelta(days=7)).strftime('%Y-%m-%d')}&to={datetime.datetime.now().strftime('%Y-%m-%d')}&token={settings.FINNHUB_API_KEY}"
                else:
                    url = f"https://finnhub.io/api/v1/news?category=general&token={settings.FINNHUB_API_KEY}"
                
                resp = httpx.get(url, timeout=5.0)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data[:15]:
                        dt = datetime.datetime.fromtimestamp(item.get("datetime", int(time.time())))
                        articles.append(NewsArticle(
                            title=item.get("headline", ""),
                            source=item.get("source", "Finnhub"),
                            url=item.get("url", "#"),
                            published_at=dt.strftime("%b %d, %Y %H:%M"),
                            summary=item.get("summary", ""),
                            related_symbols=[target_symbol] if symbol else [],
                            image_url=item.get("image", None)
                        ))
                    if articles:
                        NEWS_CACHE[cache_key] = (now_ts, articles)
                        return articles
            except Exception:
                pass  # Fallback to RSS feed below

        # 2. Fetch live headlines via official Yahoo Finance RSS feeds
        try:
            feed_sym = target_symbol if target_symbol != "MARKET" else "^GSPC,^NSEI,AAPL"
            rss_url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={feed_sym}&region=US&lang=en-US"
            req = urllib.request.Request(
                rss_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req, timeout=6.0) as response:
                xml_data = response.read()
                root = ET.fromstring(xml_data)
                
                for item in root.findall(".//item")[:15]:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pubdate_elem = item.find("pubDate")
                    desc_elem = item.find("description")

                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else ""
                    link = link_elem.text.strip() if link_elem is not None and link_elem.text else "#"
                    pub_str = pubdate_elem.text.strip() if pubdate_elem is not None and pubdate_elem.text else ""
                    desc = desc_elem.text.strip() if desc_elem is not None and desc_elem.text else ""

                    if title:
                        articles.append(NewsArticle(
                            title=title,
                            source="Yahoo Finance",
                            url=link,
                            published_at=pub_str,
                            summary=desc[:200] + "..." if len(desc) > 200 else desc,
                            related_symbols=[target_symbol] if target_symbol != "MARKET" else ["GLOBAL"],
                            image_url=None
                        ))
        except Exception:
            # Per prompt requirement: "If the news API is unavailable, show an appropriate empty state instead of fabricated news."
            return []

        NEWS_CACHE[cache_key] = (now_ts, articles)
        return articles

