#!/usr/bin/env ts-node
import * as fs from 'fs'
import * as path from 'path'
import { snapshotDownload } from '@huggingface/hub'

const HUGGINGFACE_REPO = 'Horbee/ministral-3-3b-gec-gguf'
const MODELS_DIR = path.join(__dirname, '..', 'models')

function ensureModelsDir() {
  if (!fs.existsSync(MODELS_DIR)) {
    console.log(`Creating models directory: ${MODELS_DIR}`)
    fs.mkdirSync(MODELS_DIR, { recursive: true })
  }
}

async function downloadModel(): Promise<void> {
  console.log(`Downloading models from Hugging Face...`)
  console.log(`Repository: ${HUGGINGFACE_REPO}`)

  await snapshotDownload({
    repo: HUGGINGFACE_REPO,
    cacheDir: MODELS_DIR,
    revision: 'main',
  })
}

async function main() {
  try {
    ensureModelsDir()

    await downloadModel()

    console.log('✓ Done! You can now start the service.')
  } catch (error) {
    console.error('Error downloading model:', error)
    process.exit(1)
  }
}

main()
