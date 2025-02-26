import deepl
from dotenv import load_dotenv
import os

load_dotenv()

auth_key = os.getenv("DEEPL_API_KEY")
deepl_client = deepl.DeepLClient(auth_key)


def fix_text(text: str) -> str:
    # using back and forth translation, becuase rephrase is only available in DeepL Pro
    en_trans = deepl_client.translate_text(text, target_lang="EN-US")
    de_trans = deepl_client.translate_text(en_trans.text, target_lang="DE")
    return de_trans.text
