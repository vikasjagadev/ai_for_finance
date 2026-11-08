import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.models.models import Prediction, User
from app.schemas.schemas import (
    PredictionRequest, PredictionResponse, SavedPredictionResponse
)
from app.ml.predictor import StockPredictorEngine
from app.utils.security import get_current_user_optional, get_current_user

router = APIRouter(prefix="/predictions", tags=["AI Predictions"])

@router.post("", response_model=PredictionResponse)
def create_prediction(
    req: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    try:
        prediction_res = StockPredictorEngine.generate_prediction(req)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI model training and inference encountered an issue: {str(e)}"
        )

    # Save prediction history to database
    try:
        metrics_dict = prediction_res.metrics.model_dump()
        new_pred = Prediction(
            user_id=current_user.id if current_user else None,
            stock_symbol=prediction_res.symbol,
            company_name=prediction_res.name,
            prediction_horizon=prediction_res.prediction_horizon,
            current_price=prediction_res.current_price,
            predicted_price=prediction_res.predicted_price,
            expected_change_percent=prediction_res.expected_change_percent,
            trend=prediction_res.trend,
            model_name=prediction_res.model_name,
            metrics_json=json.dumps(metrics_dict),
            confidence_lower=prediction_res.confidence_interval.get("lower_bound"),
            confidence_upper=prediction_res.confidence_interval.get("upper_bound")
        )
        db.add(new_pred)
        db.commit()
        db.refresh(new_pred)
        prediction_res.id = new_pred.id
    except Exception:
        db.rollback()
        # Continue and return the calculated prediction even if database logging failed

    return prediction_res

@router.get("", response_model=List[SavedPredictionResponse])
def get_user_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preds = db.query(Prediction).filter(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.created_at.desc()).limit(20).all()
    return [SavedPredictionResponse.model_validate(p) for p in preds]

@router.get("/{id}", response_model=SavedPredictionResponse)
def get_prediction_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pred = db.query(Prediction).filter(
        Prediction.id == id,
        Prediction.user_id == current_user.id
    ).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return SavedPredictionResponse.model_validate(pred)

