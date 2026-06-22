# System

# Third-party
from fastapi import FastAPI

# Project
from app.api.routes.Routes import router as routes_router
from app.models.LMStudio import LMStudioClient
from app.services.PredictionService import PredictionService
from app.utils.lifespanManager import lifespanManager

# LMStudio client
# Get system prompt from  "system_prompt.txt" if it exists, otherwise use default prompt
lm_client = LMStudioClient()
prediction_service = PredictionService(lm_client)


# App
app = FastAPI(
    title="LiveKick AI Service",
    version="0.1.0",
    description="Analytical service for LiveKick football predictions.",
    lifespan=lifespanManager,
)

# Expose shared services through FastAPI state to avoid circular imports.
app.state.lm_client = lm_client
app.state.prediction_service = prediction_service

app.include_router(routes_router)

