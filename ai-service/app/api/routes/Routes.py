# System
from datetime import datetime, timezone
import json

# Project
from main import app, lm_client
from utils.BaseModel import PredictionRequest, PredictionResponse
from utils.PredictionManager import _fallback_prediction, _extract_json_payload

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "UP"}


@app.get("/model-status")
def model_status() -> dict[str, str]:
    """
    Not yet available in LMStudio. This endpoint is a placeholder for future implementation.

    """
    return {"status": "Model status endpoint not yet implemented."}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    prompt = (
        "Respond ONLY with valid JSON (no markdown, no extra text) using this schema: "
        "{"
        '"home_win_probability": float, '
        '"draw_probability": float, '
        '"away_win_probability": float, '
        '"predicted_home_score": int, '
        '"predicted_away_score": int, '
        '"confidence_score": float, '
        '"explanation": string'
        "}. "
        "Use percentages from 0 to 100 for probabilities and confidence score. "
        f"Match context: home_team={payload.home_team.name} ({payload.home_team.fifa_code}), "
        f"away_team={payload.away_team.name} ({payload.away_team.fifa_code}), "
        f"match_id={payload.match_id}."

    )

    model_output = lm_client.generate_text(prompt, temperature=0)
    print(f"Model output for match_id={payload.match_id}: {model_output}")
    if model_output.startswith("Error:"):
        return _fallback_prediction(
            payload.match_id,
            "LMStudio unavailable. Fallback prediction returned.",
        )

    try:
        prediction_data = _extract_json_payload(model_output)
        return PredictionResponse(
            match_id=payload.match_id,
            home_win_probability=float(prediction_data["home_win_probability"]),
            draw_probability=float(prediction_data["draw_probability"]),
            away_win_probability=float(prediction_data["away_win_probability"]),
            predicted_home_score=int(prediction_data["predicted_home_score"]),
            predicted_away_score=int(prediction_data["predicted_away_score"]),
            confidence_score=float(prediction_data["confidence_score"]),
            model_name="lmstudio-local-model",
            explanation=str(prediction_data["explanation"]),
            generated_at=datetime.now(timezone.utc),
        )
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return _fallback_prediction(
            payload.match_id,
            "Invalid model output format. Fallback prediction returned.",
        )
