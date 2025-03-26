from string import Template
from typing import Literal

import httpx
from timeit import default_timer as timer

OLLAMA_ENDPOINT = "http://localhost:11434"
OLLAMA_CONFIG = {
    "keep_alive": "5m",
    "stream": False,
}

PROMPT_TEMPLATE = Template(
    """Fix all typos and casing and punctuation in this text and make it grammatically correct, but keep the source language:

    $text

    Return only the corrected text, don't include a preamble.
    """
)


def generate_fix_text_fn(model: str):
    def fix_text(text: str, targetLang: Literal["DE", "EN-US"] = "DE") -> str | None:
        prompt = PROMPT_TEMPLATE.substitute(text=text)
        start = timer()
        response = httpx.post(
            f"{OLLAMA_ENDPOINT}/api/generate",
            json={"prompt": prompt, "model": model, **OLLAMA_CONFIG},
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        end = timer()
        print(f"Time in seconds: {(end - start):.2f}s")
        if response.status_code != 200:
            print("Error", response.status_code)
            print(response.text)
            return None
        return response.json()["response"].strip()
    return fix_text


def get_model_names():
    response = httpx.get(
        f"{OLLAMA_ENDPOINT}/api/tags",
        headers={"Content-Type": "application/json"},
    )
    res = response.json()
    models = res["models"]
    return [model["name"] for model in models]


if __name__ == "__main__":
    print(get_model_names())
