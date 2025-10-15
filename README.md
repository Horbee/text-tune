# TextTune

A Python application that helps to fix german and english texts with DeepL backt-ranslation or with local LLM models using the Ollama API.

## Description

TextTune is a utility that allows you to easily translate and fix text using the DeepL translation API or local LLMs with Ollama. The application monitors your clipboard and can be triggered with keyboard shortcuts to process text.

# Python Application

## Prerequisites

- Python 3.11 or higher
- Poetry package manager

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/Horbee/texttune.git
   cd texttune/python
   ```

2. Install dependencies using Poetry:

   ```
   poetry install
   ```

3. Create a `.env` file in the project root with your DeepL API key (free version is sufficient):
   ```
   DEEPL_API_KEY=your_deepl_api_key
   ```

## Usage

1. Run the application:

   ```
   poetry run python src/main.py
   ```

2. Select DeepL or Ollama as provider via the command line

3. If you want to use Ollama, make sure to pull the model you want to use. We recommend using `llama 3.2`

   ```
   ollama pull llama3.2
   ```

## Features

- Fix german and english texts using DeepL API
- Fix german and english texts using local LLM models with Ollama
- Global keyboard shortcuts for quick access
- Clipboard monitoring

## License

[MIT](LICENSE)

Permissions cache needs a reset

Sometimes the TCC (Transparency, Consent, and Control) database gets stuck. You can reset accessibility permissions with:

```bash
tccutil reset Accessibility
```

⚠️ This clears permissions for all apps, so you’ll need to re-grant them.
