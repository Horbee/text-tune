# Text Tune Python CLI

The Python CLI offers the same text fixing workflow as the desktop app, running fully in the terminal. It translates or rewrites clipboard text with DeepL or a local LLM exposed through Ollama.

## Features

- Fix German and English text with DeepL back-translations
- Use local Ollama models for fully offline workflows
- Keyboard-triggered clipboard capture and replacement
- Lightweight command-line UX without the Electron UI

## Prerequisites

- Python 3.11 or newer
- [Poetry](https://python-poetry.org/) for dependency management
- Optional: [Ollama](https://ollama.com/) installed and the target model pulled (for local LLM mode)

## Setup

```bash
git clone https://github.com/Horbee/text-tune.git
cd text-tune/python
poetry install
```

## Configuration

Create a `.env` file inside `text-tune/python` to hold your API credentials:

```
DEEPL_API_KEY=your_deepl_api_key
```

## Usage

Run the CLI through Poetry and follow the prompts to choose your provider:

```bash
poetry run python src/main.py
```

If you plan to use Ollama, make sure your model is available before launching the CLI:

```bash
ollama pull llama3.2
```

## Troubleshooting

The CLI relies on accessibility permissions to automate copy/paste on macOS. If the app stops receiving those permissions you can reset them with:

```bash
tccutil reset Accessibility
```

⚠️ Resetting clears Accessibility permissions for _all_ apps—you will need to re-authorize them on next use.

## License

[MIT](../LICENSE)
