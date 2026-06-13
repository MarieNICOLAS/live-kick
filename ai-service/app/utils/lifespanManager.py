# System
from contextlib import asynccontextmanager

# Third-party
from fastapi import FastAPI

@asynccontextmanager
async def lifespanManager(app: FastAPI):
    lm_client = getattr(app.state, "lm_client", None)
    if lm_client is None:
        raise RuntimeError("LM client is not initialized on app.state")

    print("Loading models and initializing resources...")
    lm_client.load_model()

    yield  # Application is running here
    
    print("Releasing models and shutting down resources...")
    lm_client.unload_model(lm_client.instance_id)
