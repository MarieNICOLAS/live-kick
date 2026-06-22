# System
from typing import Annotated

# Third-party
from fastapi import APIRouter, Depends

# Project
from app.api.dependencies import get_prediction_service
from app.utils.BaseModel import PredictionRequest, PredictionResponse
from app.services.PredictionService import PredictionService

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "UP"}


@router.get("/")
def root() -> dict[str, str]:
    return {"status": "UP", "service": "LiveKick AI Service"}


@router.get("/model_status")
@router.get("/model-status")
def model_status() -> dict[str, str]:
    """
    Not yet available in LMStudio. This endpoint is a placeholder for future implementation.

    """
    return {"status": "Model status endpoint not yet implemented."}


@router.post("/predict", response_model=PredictionResponse)
def predict(
    payload: PredictionRequest,
    prediction_service: Annotated[PredictionService, Depends(get_prediction_service)],
) -> PredictionResponse:
    return prediction_service.predict(payload)
