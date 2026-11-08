from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.database import get_db
from app.models.models import Portfolio, User
from app.schemas.schemas import (
    PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemResponse, PortfolioSummaryResponse
)
from app.services.market_data import MarketDataService, STOCK_UNIVERSE
from app.utils.security import get_current_user

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("", response_model=PortfolioSummaryResponse)
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    holdings = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).order_by(Portfolio.created_at.desc()).all()

    items: List[PortfolioItemResponse] = []
    total_invested = 0.0
    current_total_value = 0.0

    for h in holdings:
        # Fetch current price
        try:
            quote = MarketDataService.get_stock_quote(h.stock_symbol)
            cur_price = quote.current_price
            currency = quote.currency
        except Exception:
            cur_price = h.purchase_price
            currency = "INR" if ".NS" in h.stock_symbol else "USD"

        cost_basis = round(h.purchase_price * h.quantity, 2)
        cur_value = round(cur_price * h.quantity, 2)
        pnl = round(cur_value - cost_basis, 2)
        pnl_pct = round((pnl / cost_basis) * 100, 2) if cost_basis > 0 else 0.0

        total_invested += cost_basis
        current_total_value += cur_value

        items.append(PortfolioItemResponse(
            id=h.id,
            user_id=h.user_id,
            stock_symbol=h.stock_symbol,
            company_name=h.company_name,
            purchase_price=h.purchase_price,
            quantity=h.quantity,
            purchase_date=h.purchase_date,
            notes=h.notes,
            created_at=h.created_at,
            current_price=cur_price,
            total_invested=cost_basis,
            current_value=cur_value,
            total_profit_loss=pnl,
            profit_loss_percent=pnl_pct,
            currency=currency
        ))

    overall_pnl = round(current_total_value - total_invested, 2)
    overall_pnl_pct = round((overall_pnl / total_invested) * 100, 2) if total_invested > 0 else 0.0

    # Determine top & worst performer
    top_performer = None
    worst_performer = None
    if items:
        sorted_by_pct = sorted(items, key=lambda x: x.profit_loss_percent, reverse=True)
        top_performer = {
            "symbol": sorted_by_pct[0].stock_symbol,
            "company_name": sorted_by_pct[0].company_name,
            "profit_loss_percent": sorted_by_pct[0].profit_loss_percent
        }
        worst_performer = {
            "symbol": sorted_by_pct[-1].stock_symbol,
            "company_name": sorted_by_pct[-1].company_name,
            "profit_loss_percent": sorted_by_pct[-1].profit_loss_percent
        }

    # Allocation breakdown
    allocation = []
    if current_total_value > 0:
        for item in items:
            alloc_pct = round((item.current_value / current_total_value) * 100, 2)
            allocation.append({
                "symbol": item.stock_symbol,
                "name": item.company_name,
                "value": item.current_value,
                "percent": alloc_pct
            })

    return PortfolioSummaryResponse(
        total_invested=round(total_invested, 2),
        current_value=round(current_total_value, 2),
        total_profit_loss=overall_pnl,
        profit_loss_percent=overall_pnl_pct,
        holdings_count=len(items),
        top_performer=top_performer,
        worst_performer=worst_performer,
        allocation=allocation,
        items=items
    )

@router.post("", response_model=PortfolioItemResponse, status_code=status.HTTP_201_CREATED)
def add_holding(
    payload: PortfolioItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_symbol = payload.stock_symbol.strip().upper()
    meta = next((x for x in STOCK_UNIVERSE if x["symbol"].upper() == clean_symbol), None)
    company_name = payload.company_name or (meta["name"] if meta else clean_symbol)

    new_holding = Portfolio(
        user_id=current_user.id,
        stock_symbol=clean_symbol,
        company_name=company_name,
        purchase_price=payload.purchase_price,
        quantity=payload.quantity,
        purchase_date=payload.purchase_date,
        notes=payload.notes
    )
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)

    try:
        quote = MarketDataService.get_stock_quote(clean_symbol)
        cur_price = quote.current_price
        currency = quote.currency
    except Exception:
        cur_price = payload.purchase_price
        currency = "INR" if ".NS" in clean_symbol else "USD"

    cost_basis = round(payload.purchase_price * payload.quantity, 2)
    cur_value = round(cur_price * payload.quantity, 2)
    pnl = round(cur_value - cost_basis, 2)
    pnl_pct = round((pnl / cost_basis) * 100, 2) if cost_basis > 0 else 0.0

    return PortfolioItemResponse(
        id=new_holding.id,
        user_id=new_holding.user_id,
        stock_symbol=new_holding.stock_symbol,
        company_name=new_holding.company_name,
        purchase_price=new_holding.purchase_price,
        quantity=new_holding.quantity,
        purchase_date=new_holding.purchase_date,
        notes=new_holding.notes,
        created_at=new_holding.created_at,
        current_price=cur_price,
        total_invested=cost_basis,
        current_value=cur_value,
        total_profit_loss=pnl,
        profit_loss_percent=pnl_pct,
        currency=currency
    )

@router.put("/{id}", response_model=PortfolioItemResponse)
def update_holding(
    id: int,
    payload: PortfolioItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    holding = db.query(Portfolio).filter(
        Portfolio.id == id,
        Portfolio.user_id == current_user.id
    ).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Portfolio position not found.")

    if payload.purchase_price is not None:
        holding.purchase_price = payload.purchase_price
    if payload.quantity is not None:
        holding.quantity = payload.quantity
    if payload.purchase_date is not None:
        holding.purchase_date = payload.purchase_date
    if payload.notes is not None:
        holding.notes = payload.notes

    db.commit()
    db.refresh(holding)

    try:
        quote = MarketDataService.get_stock_quote(holding.stock_symbol)
        cur_price = quote.current_price
        currency = quote.currency
    except Exception:
        cur_price = holding.purchase_price
        currency = "INR" if ".NS" in holding.stock_symbol else "USD"

    cost_basis = round(holding.purchase_price * holding.quantity, 2)
    cur_value = round(cur_price * holding.quantity, 2)
    pnl = round(cur_value - cost_basis, 2)
    pnl_pct = round((pnl / cost_basis) * 100, 2) if cost_basis > 0 else 0.0

    return PortfolioItemResponse(
        id=holding.id,
        user_id=holding.user_id,
        stock_symbol=holding.stock_symbol,
        company_name=holding.company_name,
        purchase_price=holding.purchase_price,
        quantity=holding.quantity,
        purchase_date=holding.purchase_date,
        notes=holding.notes,
        created_at=holding.created_at,
        current_price=cur_price,
        total_invested=cost_basis,
        current_value=cur_value,
        total_profit_loss=pnl,
        profit_loss_percent=pnl_pct,
        currency=currency
    )

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_holding(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    holding = db.query(Portfolio).filter(
        Portfolio.id == id,
        Portfolio.user_id == current_user.id
    ).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Portfolio position not found.")

    db.delete(holding)
    db.commit()
    return {"message": "Position successfully deleted from portfolio.", "id": id}

