import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const configPath = path.join(app.getPath('userData'), 'config.json')

type AppConfig = {
  workingMode: 'deepl' | 'ollama'
  ollamaModel: string | null
  backgroundNotificationShown: boolean
}

export function saveConfig(data: Partial<AppConfig>) {
  const config = loadConfig()
  const updatedConfig = { ...config, ...data }

  fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8')
  console.log('Config saved to ', configPath)
}

export function loadConfig(): AppConfig {
  if (!fs.existsSync(configPath)) {
    const initialConfig: AppConfig = {
      workingMode: 'deepl',
      ollamaModel: null,
      backgroundNotificationShown: false,
    }
    return initialConfig
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as AppConfig
}
