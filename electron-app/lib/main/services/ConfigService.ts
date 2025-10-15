import type { WorkingMode } from '@/lib/main/types'
import { RegularConfigHelper, type AppConfig } from './helpers/RegularConfigHelper'
import { SecureConfigHelper, type SecureAppConfig } from './helpers/SecureConfigHelper'

export class ConfigService {
  private workingMode: WorkingMode = 'deepl'
  private ollamaModel: string | null
  private openAIModel: string | null
  private backgroundNotificationShown: boolean
  private deeplApiKey: string | null
  private openaiApiKey: string | null
  private lastWindowSize: { width: number; height: number } | null

  private readonly regularHelper: RegularConfigHelper
  private readonly secureHelper: SecureConfigHelper

  constructor() {
    this.regularHelper = new RegularConfigHelper()
    this.secureHelper = new SecureConfigHelper()

    const cfg = this.regularHelper.load()
    const secure = this.secureHelper.load()

    this.workingMode = cfg.workingMode
    this.ollamaModel = cfg.ollamaModel
    this.openAIModel = cfg.openAIModel
    this.backgroundNotificationShown = cfg.backgroundNotificationShown
    this.lastWindowSize = cfg.lastWindowSize || null
    this.deeplApiKey = secure?.deeplApiKey || null
    this.openaiApiKey = secure?.openaiApiKey || null
  }

  getWorkingMode() {
    return this.workingMode
  }
  setWorkingMode(mode: WorkingMode) {
    console.log('[ConfigService] Setting working mode:', mode)
    this.workingMode = mode
    this.saveRegular()
  }

  getOllamaModel() {
    return this.ollamaModel
  }
  setOllamaModel(model: string | null) {
    this.ollamaModel = model
    this.saveRegular()
  }

  getOpenAIModel() {
    return this.openAIModel
  }
  setOpenAIModel(model: string | null) {
    this.openAIModel = model
    this.saveRegular()
  }

  getDeepLApiKey() {
    return this.deeplApiKey
  }
  setDeepLApiKey(key: string | null) {
    this.deeplApiKey = key
    this.saveSecure()
  }

  getOpenAIKey() {
    return this.openaiApiKey
  }
  setOpenAIKey(key: string | null) {
    this.openaiApiKey = key
    this.saveSecure()
  }

  isBackgroundNotificationShown() {
    return this.backgroundNotificationShown
  }
  setBackgroundNotificationShown(value: boolean) {
    this.backgroundNotificationShown = value
    this.saveRegular()
  }

  getLastWindowSize() {
    return this.lastWindowSize
  }
  setLastWindowSize(size: { width: number; height: number } | null) {
    this.lastWindowSize = size
    this.saveRegular()
  }

  private saveRegular() {
    console.log('[ConfigService] Saving regular configuration')

    const regularConfig: AppConfig = {
      workingMode: this.workingMode,
      ollamaModel: this.ollamaModel,
      openAIModel: this.openAIModel,
      backgroundNotificationShown: this.backgroundNotificationShown,
      lastWindowSize: this.lastWindowSize,
    }

    this.regularHelper.save(regularConfig)
  }

  private saveSecure() {
    console.log('[ConfigService] Saving secure configuration')

    const secureConfig: SecureAppConfig = {
      deeplApiKey: this.deeplApiKey,
      openaiApiKey: this.openaiApiKey,
    }

    this.secureHelper.save(secureConfig)
  }

  resetSecureConfig() {
    console.log('[ConfigService] Resetting secure configuration')
    this.secureHelper.reset()
    this.deeplApiKey = null
    this.openaiApiKey = null
  }
}
