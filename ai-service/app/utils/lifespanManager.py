# System
import asyncio
from contextlib import asynccontextmanager

# Third-party
from fastapi import FastAPI


async def _load_model(lm_client) -> None:
    print("Loading models and initializing resources...")
    result = await asyncio.to_thread(lm_client.load_model)
    if isinstance(result, dict) and "error" in result:
        print(f"LMStudio model load failed: {result['error']}")


@asynccontextmanager
async def lifespanManager(app: FastAPI):
    lm_client = getattr(app.state, "lm_client", None)
    if lm_client is None:
        raise RuntimeError("LM client is not initialized on app.state")

    app.state.model_load_task = asyncio.create_task(_load_model(lm_client))

    yield  # Application is running here
    
    print("Releasing models and shutting down resources...")
    lm_client.unload_model(lm_client.instance_id)
