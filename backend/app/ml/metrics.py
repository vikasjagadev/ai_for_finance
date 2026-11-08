import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from app.schemas.schemas import ModelMetrics

def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray, y_baseline: np.ndarray, y_prior: np.ndarray) -> ModelMetrics:
    """
    Computes rigorous financial model evaluation metrics.
    - y_true: actual observed prices at t+h
    - y_pred: model forecasted prices for t+h
    - y_baseline: naive persistence baseline (price at time t)
    - y_prior: price at time t used to determine direction
    """
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))

    # MAPE with zero-division safeguard
    non_zero_mask = y_true > 1e-6
    if np.any(non_zero_mask):
        mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100)
        baseline_mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_baseline[non_zero_mask]) / y_true[non_zero_mask])) * 100)
    else:
        mape = 0.0
        baseline_mape = 0.0

    baseline_mae = float(mean_absolute_error(y_true, y_baseline))
    r2 = float(r2_score(y_true, y_pred))

    # Directional accuracy: sign of (y_pred - y_prior) vs sign of (y_true - y_prior)
    pred_dir = np.sign(y_pred - y_prior)
    true_dir = np.sign(y_true - y_prior)
    directional_accuracy = float(np.mean(pred_dir == true_dir) * 100)

    return ModelMetrics(
        mae=round(mae, 2),
        rmse=round(rmse, 2),
        mape=round(mape, 2),
        directional_accuracy_percent=round(directional_accuracy, 1),
        baseline_mae=round(baseline_mae, 2),
        baseline_mape=round(baseline_mape, 2),
        r2_score=round(r2, 3)
    )

