import { safeStorage, app } from 'electron'
import fs from 'fs'
import path from 'path'

export type SecureAppConfig = {
  deeplApiKey: string | null
  openaiApiKey: string | null
}

export class SecureConfigHelper {
  private readonly secureConfigPath: string

  constructor() {
    this.secureConfigPath = path.join(app.getPath('userData'), 'secure-config.json')
  }

  load(): SecureAppConfig | null {
    if (!fs.existsSync(this.secureConfigPath)) return null
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('[SecureConfigHelper] Encryption not available; cannot read secure config.')
      return null
    }

    try {
      const encrypted = fs.readFileSync(this.secureConfigPath)
      const decrypted = safeStorage.decryptString(encrypted)
      const parsed = JSON.parse(decrypted)

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid secure config structure')
      }

      return {
        deeplApiKey: 'deeplApiKey' in parsed ? parsed.deeplApiKey : null,
        openaiApiKey: 'openaiApiKey' in parsed ? parsed.openaiApiKey : null,
      }
    } catch (err) {
      console.error('[SecureConfigHelper] Could not decrypt/parse secure config, backing up and returning null:', err)
      this.backupCorruptFile()
      return null
    }
  }

  save(data: SecureAppConfig) {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('[SecureConfigHelper] Encryption not available; secure config not saved.')
      return
    }

    try {
      const encrypted = safeStorage.encryptString(JSON.stringify(data))
      fs.writeFileSync(this.secureConfigPath, encrypted)
      console.log('[SecureConfigHelper] Secure config saved')
    } catch (err) {
      console.error('[SecureConfigHelper] Failed to write secure config:', err)
    }
  }

  reset() {
    try {
      if (fs.existsSync(this.secureConfigPath)) {
        fs.unlinkSync(this.secureConfigPath)
        console.log('[SecureConfigHelper] Secure config reset')
      }
    } catch (err) {
      console.error('[SecureConfigHelper] Failed to reset secure config:', err)
    }
  }

  private backupCorruptFile() {
    try {
      const backup = this.secureConfigPath + '.corrupt-' + Date.now()
      fs.renameSync(this.secureConfigPath, backup)
      console.error('[SecureConfigHelper] Corrupt secure config moved to', backup)
    } catch (renameErr) {
      console.error('[SecureConfigHelper] Failed to backup corrupt secure config:', renameErr)
    }
  }
}
