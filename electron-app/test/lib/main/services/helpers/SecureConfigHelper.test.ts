import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setFs, resetFs } from '@/test/helpers/fs-store'
import { safeStorage } from 'electron'

import { SecureConfigHelper } from '@/lib/main/services/helpers/SecureConfigHelper'

describe('SecureConfigHelper', () => {
  let helper: SecureConfigHelper

  beforeEach(() => {
    resetFs()
    vi.clearAllMocks()
    vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true)
    vi.mocked(safeStorage.decryptString).mockImplementation((b) => (b as Buffer).toString())
    helper = new SecureConfigHelper()
  })

  describe('load()', () => {
    it('returns null when config file does not exist', () => {
      expect(helper.load()).toBeNull()
    })

    it('returns null when encryption is not available', () => {
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false)
      setFs(helper['secureConfigPath'], Buffer.from('data'))
      expect(helper.load()).toBeNull()
    })

    it('decrypts and parses valid encrypted config', () => {
      setFs(helper['secureConfigPath'], Buffer.from(JSON.stringify({ deeplApiKey: 'dkey', openaiApiKey: 'okey' })))
      expect(helper.load()).toEqual({ deeplApiKey: 'dkey', openaiApiKey: 'okey' })
    })

    it('rejects non-object JSON', () => {
      setFs(helper['secureConfigPath'], Buffer.from('"string"'))
      expect(helper.load()).toBeNull()
    })

    it('rejects null JSON', () => {
      setFs(helper['secureConfigPath'], Buffer.from('null'))
      expect(helper.load()).toBeNull()
    })

    it('returns partial config', () => {
      setFs(helper['secureConfigPath'], Buffer.from(JSON.stringify({ deeplApiKey: 'only' })))
      expect(helper.load()).toEqual({ deeplApiKey: 'only', openaiApiKey: null })
    })

    it('backs up corrupt file on decrypt failure', () => {
      vi.mocked(safeStorage.decryptString).mockImplementationOnce(() => { throw new Error('bad') })
      setFs(helper['secureConfigPath'], Buffer.from('garbage'))
      expect(helper.load()).toBeNull()
    })
  })

  describe('save()', () => {
    it('skips when encryption unavailable', () => {
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false)
      helper.save({ deeplApiKey: 'k', openaiApiKey: null })
      expect(safeStorage.encryptString).not.toHaveBeenCalled()
    })

    it('encrypts and writes', () => {
      helper.save({ deeplApiKey: 'dk', openaiApiKey: 'ok' })
      expect(safeStorage.encryptString).toHaveBeenCalledWith(
        JSON.stringify({ deeplApiKey: 'dk', openaiApiKey: 'ok' }),
      )
    })
  })

  describe('reset()', () => {
    it('does not throw if file exists', () => {
      setFs(helper['secureConfigPath'], Buffer.from('x'))
      expect(() => helper.reset()).not.toThrow()
    })

    it('does not throw if file missing', () => {
      expect(() => helper.reset()).not.toThrow()
    })
  })
})
