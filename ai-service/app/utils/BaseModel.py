# System
from datetime import datetime
from typing import Annotated

# Third-party
from pydantic import BaseModel, Field


class TeamContext(BaseModel):
    name: Annotated[str, Field(min_length=1)]
    fifa_code: Annotated[str, Field(min_length=2, max_length=3)]


class PredictionRequest(BaseModel):
    match_id: int
    home_team: TeamContext
    away_team: TeamContext
    stadium: Annotated[str, Field(min_length=1)]
    # Optional:
    # Additional context fields, like weather, team form, injuries, etc., can be added here in the future.
    # Team compo also


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


class LoadModelRequest(BaseModel):
    model_name: Annotated[str, Field(min_length=1)] # Should be an enum list
    # Optional:
    # Additional parameters (temperature, max tokens, etc)...

class LoadModelResponse(BaseModel):
    status: Annotated[str, Field(min_length=1)]
    model_name: Annotated[str, Field(min_length=1)]
    message: Annotated[str, Field(min_length=0)]
    # params: dict = {}  # Optional: Return the parameters used for loading the model