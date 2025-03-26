import deepl
from dotenv import load_dotenv
import os
from typing import Literal

load_dotenv()

auth_key = os.getenv("DEEPL_API_KEY")
deepl_client = deepl.DeepLClient(auth_key)


def fix_text(text: str, targetLang: Literal["DE", "EN-US"] = "DE") -> str:
    # using back and forth translation, becuase rephrase is only available in DeepL Pro
    langs = ["EN-US", "DE"]
    # ensure targetLang is the last element in the langs array
    langs.remove(targetLang)
    langs.append(targetLang)

    for lang in langs:
        trans = deepl_client.translate_text(text, target_lang=lang)
        text = trans.text

    return text
