import time

from pynput import keyboard
from pynput.keyboard import Key, Controller
import pyperclip

from sys import platform

# from local_ai import fix_text
from python.src.deepl_fix import fix_text

controller = Controller()


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
    print(f"original text: {text}")

    # 3. Fix string
    if not text:
        print("no text to fix")
        return

    fixed_text = fix_text(text)
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


def on_f9():
    print("F9 fix_current_line()")
    fix_current_line()


def on_f10():
    print("F10 fix_selection()")
    fix_selection()


print("Text fixer is started and listening...")
try:
    with keyboard.GlobalHotKeys({f'{Key.f9.value}': on_f9, f'{Key.f10.value}': on_f10}) as h:
        h.join()
except KeyboardInterrupt:
    print("Text fixer is stopped")
    exit()
