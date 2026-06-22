# Third-party
from fastapi import Request

# Project
from app.services.PredictionService import PredictionService


def get_prediction_service(request: Request) -> PredictionService:
    return request.app.state.prediction_service
