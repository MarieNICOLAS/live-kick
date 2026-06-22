import os
import json
from pathlib import Path
from typing import Optional
import requests
from dotenv import load_dotenv

load_dotenv()


class LMStudioClient:
    """Client for interacting with LOCAL LMStudio API (OpenAI-compatible)"""
    
    BASE_MODEL_URL = "http://127.0.0.1:1234"
    BASE_LMSTUDIO_URL = "http://127.0.0.1:1234/api"
    
    def __init__(self, system_prompt: Optional[str] = None, instance_id: Optional[str] = None):
        """
        Initialize LMStudio client
        
        Args:
            system_prompt: Optional system prompt. If None, loads from external config.
        """
        self.base_url = self.BASE_MODEL_URL
        self.lmstudio_url = self.BASE_LMSTUDIO_URL
        self.system_prompt = system_prompt or self._load_system_prompt()
        self.instance_id = instance_id or "google/gemma-4-e2b"
    
    @staticmethod
    def _load_system_prompt() -> str:
        """Load system prompt from external config file"""
        config_path = Path(__file__).resolve().parent.parent / "config" / "system_prompt.txt"
        try:
            with config_path.open("r", encoding="utf-8") as file:
                print(f"Loaded system prompt from {config_path}")
                return file.read().strip()
        except FileNotFoundError:
            print(f"System prompt file not found at {config_path}, using default prompt.")
            return "You are a helpful assistant."
    
    
    def call_api(
        self,
        messages: list[dict],
        model: str = "google/gemma-4-e2b",
        temperature: float = 0.0,
        max_tokens: int = 2048,
    ) -> dict:
        """
        Call LMStudio API with OpenAI-compatible endpoint
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name to use
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            
        Returns:
            API response dict
        """
        url = f"{self.base_url}/v1/chat/completions"
        
        full_messages = [
            {"role": "system", "content": self.system_prompt}
        ] + messages
        
        payload = {
            "model": model,
            "messages": full_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
        except ValueError as e:
            return {"error": f"Invalid JSON response from LMStudio: {e}"}
    

    def load_model(self) -> dict:
        """
        Load a model in LMStudio
        
        Args:
            model_name: Name of the model to load
            
        Returns:
            API response dict
        """
        url = f"{self.lmstudio_url}/v1/models/load"
        payload = {
            "model": self.instance_id,
            "context_length": 1000, 
            "flash_attention": True, # Reduce memory usage and speed up inference
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
        except ValueError as e:
            return {"error": f"Invalid JSON response from LMStudio: {e}"}
        
    
    def unload_model(self, model_name: Optional[str] = None) -> dict:
        """
        Unload a model in LMStudio
        
        Args:
            model_name: Name of the model to unload. If None, uses the instance_id.
            
        Returns:
            API response dict
        """
        if model_name is None:
            model_name = self.instance_id

        url = f"{self.lmstudio_url}/v1/models/unload"
        payload = {"instance_id": model_name}
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
        except ValueError as e:
            return {"error": f"Invalid JSON response from LMStudio: {e}"}


    def generate_text(self, prompt: str, **kwargs) -> str:
        """
        Simple text generation template
        
        Args:
            prompt: User prompt
            **kwargs: Additional parameters for call_api
            
        Returns:
            Generated text response
        """
        messages = [{"role": "user", "content": prompt}]
        response = self.call_api(messages, **kwargs)
        
        if "error" in response:
            return f"Error: {response['error']}"
        
        try:
            choices = response.get("choices")
            if not choices:
                return "Error: LMStudio response does not contain choices"

            message = choices[0].get("message", {})
            content = message.get("content", "")
            if not isinstance(content, str):
                return "Error: LMStudio response content is not a string"

            return content
        except (AttributeError, IndexError, TypeError) as e:
            return f"Error: Invalid LMStudio response format: {e}"
