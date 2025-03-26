import time
import inquirer
from typing import Literal

from pynput import keyboard
from pynput.keyboard import Key, Controller
import pyperclip

from sys import platform

from local_ai import get_model_names, generate_fix_text_fn
from deepl_fix import fix_text as deepl_fix_text

controller = Controller()


questions = [
    inquirer.List('service',
                  message="Which text fixing service would you like to use?",
                  choices=['Local AI', 'DeepL'],
                  ),
]
answers = inquirer.prompt(questions)
service = answers['service']


if service == "Local AI":
    models = get_model_names()
    if len(models) == 0:
        print("No models found. Please pull a model first with ollama. For example: ollama pull llama3.2")
        exit()

    answer = inquirer.prompt([
        inquirer.List('model',
                      message="Which model would you like to use?",
                      choices=models,
                      ),
    ])
    model = answer['model']

    print(f"Using Local AI for text fixing with model: {model}")
    fix_text = generate_fix_text_fn(model)
else:
    print("Using DeepL for text fixing")
    fix_text = deepl_fix_text


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


def fix_selection(language: Literal["DE", "EN-US"] = "DE"):
    # 1. Copy selection to clipboard
    with controller.pressed(Key.cmd if platform == "darwin" else Key.ctrl):
        controller.tap("c")

    # 2. Get the clipboard string
    time.sleep(0.1)
    text = pyperclip.paste()
    print(f"original text: {text}")

    # 3. Fix string
    if not text:
        print("no text to fix")
        return

    fixed_text = fix_text(text, language)
    if not fixed_text:
        print("no fixed text")
        return

    # 4. Paste the fixed string to the clipboard
    print(f"fixed text: {fixed_text}")
    pyperclip.copy(fixed_text)
    time.sleep(0.1)

    # 5. Paste the clipboard and replace the selected text
    with controller.pressed(Key.cmd if platform == "darwin" else Key.ctrl):
        controller.tap("v")


def on_f8():
    print("F8 fix_selection() english")
    fix_selection(language="EN-US")


def on_f9():
    print("F9 fix_current_line() german")
    fix_current_line()


def on_f10():
    print("F10 fix_selection() english")
    fix_selection()


print("Text fixer is started and listening...")
try:
    with keyboard.GlobalHotKeys({f'{Key.f8.value}': on_f8, f'{Key.f9.value}': on_f9, f'{Key.f10.value}': on_f10}) as h:
        h.join()
except KeyboardInterrupt:
    print("Text fixer is stopped")
    exit()
