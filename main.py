import time
from string import Template

import httpx
from pynput import keyboard
from pynput.keyboard import Key, Controller
import pyperclip

from sys import platform


controller = Controller()

OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"
OLLAMA_CONFIG = {
    "model": "gemma2:9b-instruct-q3_K_S",
    "keep_alive": "5m",
    "stream": False,
}

PROMPT_TEMPLATE = Template(
    """Fix all typos and casing and punctuation in this text and make it grammatically correct, but keep the source language:

    $text

    Return only the corrected text, don't include a preamble.
    """
)


def fix_text(text):
    prompt = PROMPT_TEMPLATE.substitute(text=text)
    response = httpx.post(
        OLLAMA_ENDPOINT,
        json={"prompt": prompt, **OLLAMA_CONFIG},
        headers={"Content-Type": "application/json"},
        timeout=10,
    )
    if response.status_code != 200:
        print("Error", response.status_code)
        return None
    return response.json()["response"].strip()


def fix_current_line():
    if platform == "darwin":
        controller.press(Key.cmd)
        controller.press(Key.shift)        
        controller.press(Key.left)

        controller.release(Key.cmd)
        controller.release(Key.shift)        
        controller.release(Key.left)
    else:
        controller.press(Key.shift)
        controller.press(Key.home)

        controller.release(Key.shift)
        controller.release(Key.home)

    fix_selection()


def fix_selection():
    # 1. Copy selection to clipboard
    with controller.pressed(Key.cmd if platform == "darwin" else Key.ctrl):
        controller.tap("c")

    # 2. Get the clipboard string
    time.sleep(0.1)
    text = pyperclip.paste()

    # 3. Fix string
    if not text:
        return
    fixed_text = fix_text(text)
    print(fixed_text)
    if not fixed_text:
        return

    # 4. Paste the fixed string to the clipboard
    pyperclip.copy(fixed_text)
    time.sleep(0.1)

    # 5. Paste the clipboard and replace the selected text
    with controller.pressed(Key.cmd if platform == "darwin" else Key.ctrl):
        controller.tap("v")


def on_f9():
    print("F9")
    fix_current_line()


def on_f10():
    print("F10")
    fix_selection()


with keyboard.GlobalHotKeys({ f'{Key.f9.value}' : on_f9, f'{Key.f10.value}': on_f10}) as h:
    h.join()