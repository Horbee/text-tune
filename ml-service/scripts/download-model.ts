#!/usr/bin/env ts-node
import { downloadFile } from '@huggingface/hub'
import * as fs from 'fs'
import * as path from 'path'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

async function downloadModel() {
  const REPO_ID = 'Horbee/Ministral-3-GEC-german-GGUF'
  const FILENAME = 'Ministral-8B-Q4_K_M.gguf'
  const LOCAL_DIR = path.join(__dirname, '..', 'models')
  const REVISION = 'main'

  console.log(`Starting download for ${FILENAME}...`)

  // 1. Fetch the file from Hugging Face
  const response = await downloadFile({
    repo: REPO_ID,
    path: FILENAME,
    revision: REVISION,
  })

  if (!response) {
    throw new Error('Download failed: Response was null.')
  }

  const webStream = (response as any).body

  if (!webStream) {
    throw new Error('Download failed: Response body is empty.')
  }

  // 2. Ensure local directory exists (Replicates 'local_dir')
  if (!fs.existsSync(LOCAL_DIR)) {
    fs.mkdirSync(LOCAL_DIR, { recursive: true })
  }

  // 3. Define the destination path
  const destinationPath = path.join(LOCAL_DIR, FILENAME)
  const fileStream = fs.createWriteStream(destinationPath)

  // 4. Convert Web Stream to Node Stream and write to disk
  // (Replicates 'local_dir_use_symlinks=False' by writing actual bytes)
  const nodeStream = Readable.fromWeb(webStream)

  await finished(nodeStream.pipe(fileStream))

  console.log(`Download complete: ${destinationPath}`)
}

downloadModel().catch(console.error)
