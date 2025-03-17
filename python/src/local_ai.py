from string import Template

import httpx
from timeit import default_timer as timer

OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"
OLLAMA_CONFIG = {
    "model": "llama3.2",
    "keep_alive": "5m",
    "stream": False,
}

PROMPT_TEMPLATE = Template(
    """Fix all typos and casing and punctuation in this text and make it grammatically correct, but keep the source language:

    $text

    Return only the corrected text, don't include a preamble.
    """
)


def fix_text(text: str) -> str | None:
    prompt = PROMPT_TEMPLATE.substitute(text=text)
    start = timer()
    response = httpx.post(
        OLLAMA_ENDPOINT,
        json={"prompt": prompt, **OLLAMA_CONFIG},
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
