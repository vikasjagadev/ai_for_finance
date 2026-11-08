from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Watchlist, User
from app.schemas.schemas import WatchlistItemCreate, WatchlistItemResponse
from app.services.market_data import MarketDataService, STOCK_UNIVERSE
from app.utils.security import get_current_user

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

@router.get("", response_model=List[WatchlistItemResponse])
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id
    ).order_by(Watchlist.created_at.desc()).all()

    enriched_items: List[WatchlistItemResponse] = []
    for item in items:
        resp_item = WatchlistItemResponse.model_validate(item)
        try:
            # Enrich with real-time stock quote
            quote = MarketDataService.get_stock_quote(item.stock_symbol)
            resp_item.quote = quote
        except Exception:
            resp_item.quote = None
        enriched_items.append(resp_item)

    return enriched_items

@router.post("", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    payload: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_symbol = payload.stock_symbol.strip().upper()

    # Check if already in watchlist
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.stock_symbol == clean_symbol
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{clean_symbol} is already in your watchlist."
        )

    meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
    company_name = payload.company_name or (meta["name"] if meta else clean_symbol)
    exchange = payload.exchange or (meta["exchange"] if meta else ("NSE" if ".NS" in clean_symbol else "US"))

    new_item = Watchlist(
        user_id=current_user.id,
        stock_symbol=clean_symbol,
        company_name=company_name,
        exchange=exchange
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    resp_item = WatchlistItemResponse.model_validate(new_item)
    try:
        resp_item.quote = MarketDataService.get_stock_quote(clean_symbol)
    except Exception:
        resp_item.quote = None

    return resp_item

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def remove_from_watchlist(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Watchlist).filter(
        Watchlist.id == id,
        Watchlist.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist entry not found.")

    db.delete(item)
    db.commit()
    return {"message": "Stock successfully removed from watchlist.", "id": id}

