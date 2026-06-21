# System

# Third-party
from fastapi import FastAPI

# Project
from models.LMStudio import LMStudioClient
from utils.lifespanManager import lifespanManager

# LMStudio client
# Get system prompt from  "system_prompt.txt" if it exists, otherwise use default prompt
lm_client = LMStudioClient()


# App
app = FastAPI(
    title="LiveKick AI Service",
    version="0.1.0",
    description="Analytical service for LiveKick football predictions.",
    lifespan=lifespanManager,
)

# Expose shared services through FastAPI state to avoid circular imports.
app.state.lm_client = lm_client

