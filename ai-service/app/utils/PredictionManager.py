# System
from datetime import datetime, timezone
import json

# Project
from utils.BaseModel import PredictionResponse

# Noted as not used, but USED in routes.py.
def _fallback_prediction(match_id: int, explanation: str) -> PredictionResponse:
    return PredictionResponse(
        match_id=match_id,
        home_win_probability=0.0,
        draw_probability=0.0,
        away_win_probability=0.0,
        predicted_home_score=0,
        predicted_away_score=0,
        confidence_score=0.0,
        model_name="None",
        explanation=explanation,
        generated_at=datetime.now(timezone.utc),
    )

# Noted as not used, but USED in routes.py.
def _extract_json_payload(raw_text: str) -> dict:
    content = raw_text.strip()

    if content.startswith("```"):
        content = content.strip("`").strip()
        if content.lower().startswith("json"):
            content = content[4:].strip()

    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON object found in model response")

    return json.loads(content[start : end + 1])
