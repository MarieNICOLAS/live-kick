from datetime import datetime, timezone
from typing import Annotated

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="LiveKick AI Service",
    version="0.1.0",
    description="Analytical service for LiveKick football predictions.",
)


class TeamContext(BaseModel):
    name: Annotated[str, Field(min_length=1)]
    fifa_code: Annotated[str, Field(min_length=2, max_length=3)]


class PredictionRequest(BaseModel):
    match_id: int
    home_team: TeamContext
    away_team: TeamContext


class PredictionResponse(BaseModel):
    match_id: int
    home_win_probability: float
    draw_probability: float
    away_win_probability: float
    predicted_home_score: int
    predicted_away_score: int
    confidence_score: float
    model_name: str
    explanation: str
    generated_at: datetime


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "UP"}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    return PredictionResponse(
        match_id=payload.match_id,
        home_win_probability=34.0,
        draw_probability=32.0,
        away_win_probability=34.0,
        predicted_home_score=1,
        predicted_away_score=1,
        confidence_score=50.0,
        model_name="livekick-baseline-v0",
        explanation="Baseline prediction until the analytical model is connected.",
        generated_at=datetime.now(timezone.utc),
    )
