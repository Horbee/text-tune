import { app } from 'electron'
import fs from 'fs'
import path from 'path'

import type { WorkingMode } from '@/lib/main/types'

export type AppConfig = {
  workingMode: WorkingMode
  ollamaModel: string | null
  openAIModel: string | null
  textTuneServerUrl: string | null
  backgroundNotificationShown: boolean
  lastWindowSize: { width: number; height: number } | null
}

export class RegularConfigHelper {
  private readonly configPath: string

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json')
  }

  load(): AppConfig {
    if (!fs.existsSync(this.configPath)) {
      const initialConfig: AppConfig = {
        workingMode: 'deepl',
        ollamaModel: null,
        openAIModel: null,
        textTuneServerUrl: null,
        backgroundNotificationShown: false,
        lastWindowSize: null,
      }
      return initialConfig
    }

    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf-8')) as AppConfig
    } catch (err) {
      console.error('[RegularConfigHelper] Failed to parse config, returning defaults:', err)
      return {
        workingMode: 'deepl',
        ollamaModel: null,
        openAIModel: null,
        textTuneServerUrl: null,
        backgroundNotificationShown: false,
        lastWindowSize: null,
      }
    }
  }

  save(data: AppConfig) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2), 'utf-8')
      console.log('[RegularConfigHelper] Config saved to', this.configPath)
    } catch (err) {
      console.error('[RegularConfigHelper] Failed to save config:', err)
    }
  }
}
