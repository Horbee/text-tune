import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

const HF_URL = 'https://huggingface.co/Horbee/Text-Tune-Small-v13/resolve/main/Text-Tune-Small-v13.gguf'
const MODEL_FILENAME = 'Text-Tune-Small-v13.gguf'

export class ModelDownloader {
  constructor(private cacheDir: string) {}

  getModelPath(): string {
    return path.join(this.cacheDir, MODEL_FILENAME)
  }

  isDownloaded(): boolean {
    return fs.existsSync(this.getModelPath())
  }

  async ensureExists(onProgress?: (percentage: number) => void): Promise<string> {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true })
    }

    const modelPath = this.getModelPath()

    if (fs.existsSync(modelPath)) {
      console.log(`[Cache] Model found at: ${modelPath}`)
      return modelPath
    }

    console.log(`[Download] Model missing. Downloading to cache...`)
    const response = await fetch(HF_URL)

    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('Response body is empty — nothing to download')
    }

    const contentLength = response.headers.get('content-length')
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0
    let downloadedBytes = 0
    let lastReportedPercentage = 0

    const fileStream = fs.createWriteStream(modelPath)
    const nodeStream = Readable.fromWeb(response.body as any)

    nodeStream.on('data', (chunk) => {
      downloadedBytes += chunk.length

      if (totalBytes) {
        const percentage = Math.round((downloadedBytes / totalBytes) * 100)

        if (percentage !== lastReportedPercentage) {
          lastReportedPercentage = percentage
          onProgress?.(percentage)

          if (percentage % 10 === 0) {
            console.log(`Downloading... ${percentage}%`)
          }
        }
      }
    })

    try {
      await pipeline(nodeStream, fileStream)
    } catch (err) {
      fs.rmSync(modelPath, { force: true })
      throw err
    }

    console.log('Download complete!')
    return modelPath
  }
}
