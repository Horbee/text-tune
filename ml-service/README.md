# ML Service

## Prerequisites

Install docker with the nvidia-container-toolkit and configure it:
https://hub.docker.com/r/ollama/ollama

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Download the GGUF model from Hugging Face:

```bash
pnpm download-model
```

This will download the `ministral-3-3b-instruct-Q8_0.gguf` model from Hugging Face and place it in the `models/` folder.

- The model is approximately 3.9GB in size.

3. Set up environment variables:

```bash
mv .env.example .env
```

4. Start the service:

```bash
docker compose up
```
