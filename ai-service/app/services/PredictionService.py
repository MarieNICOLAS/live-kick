# System
from datetime import datetime, timezone
import json

# Project
from app.utils.BaseModel import PredictionRequest, PredictionResponse
from app.utils.PredictionManager import fallback_prediction, extract_json_payload


class PredictionService:
    def __init__(self, lm_client) -> None:
        self.lm_client = lm_client

    def predict(self, payload: PredictionRequest) -> PredictionResponse:
        model_output = self._generate_model_output(payload)
        if not isinstance(model_output, str) or model_output.startswith("Error:"):
            return fallback_prediction(
                payload.match_id,
                "LMStudio unavailable. Fallback prediction returned.",
            )

        print(f"Model output for match_id={payload.match_id}: {model_output}")
        try:
            prediction_data = extract_json_payload(model_output)
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
            return fallback_prediction(
                payload.match_id,
                "Invalid model output format. Fallback prediction returned.",
            )

    def _generate_model_output(self, payload: PredictionRequest) -> str:
        prompt = self._build_prompt(payload)
        try:
            return self.lm_client.generate_text(prompt, temperature=0)
        except Exception:
            return "Error: LMStudio unavailable"

    @staticmethod
    def _build_prompt(payload: PredictionRequest) -> str:
        return (
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
