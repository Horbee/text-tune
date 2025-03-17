# AI Text Fixer

A Python application that helps to fix german texts with DeepL backt-ranslation or with local LLM models using the Ollama API.

## Description

AI Text Fixer is a utility that allows you to easily translate and fix text using the DeepL translation API or local LLMs with Ollama. The application monitors your clipboard and can be triggered with keyboard shortcuts to process text.

## Prerequisites

- Python 3.11 or higher
- Poetry package manager

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/Horbee/ai-text-fixer.git
   cd ai-text-fixer/python
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

## Docker Support

The project includes Docker configuration for containerized deployment:

1. Build and run with Docker Compose:

   ```
   docker-compose up -d
   ```

2. To use the Ollama service for local LLM support:
   ```
   docker-compose up ollama -d
   ```

## Features

- Text translation using DeepL API
- Global keyboard shortcuts for quick access
- Clipboard monitoring
- Docker support for containerized deployment

## License

[MIT](LICENSE)
