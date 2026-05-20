import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs from 'fs'
import { setFs, resetFs } from '@/test/helpers/fs-store'

import { RegularConfigHelper, type AppConfig } from '@/lib/main/services/helpers/RegularConfigHelper'

const defaults: AppConfig = {
  workingMode: 'deepl', ollamaModel: null, openAIModel: null,
  textTuneServerUrl: null, textTuneModel: null,
  backgroundNotificationShown: false, lastWindowSize: null,
}

describe('RegularConfigHelper', () => {
  let helper: RegularConfigHelper

  beforeEach(() => {
    resetFs()
    vi.clearAllMocks()
    helper = new RegularConfigHelper()
  })

  describe('load()', () => {
    it('returns defaults when file missing', () => {
      expect(helper.load()).toEqual(defaults)
    })

    it('parses valid JSON', () => {
      const cfg = { ...defaults, workingMode: 'chatgpt', ollamaModel: 'llama3' as const, lastWindowSize: { width: 1200, height: 800 } }
      setFs(helper['configPath'], JSON.stringify(cfg))
      expect(helper.load()).toEqual(cfg)
    })

    it('returns defaults on corrupt JSON', () => {
      setFs(helper['configPath'], '{broken')
      expect(helper.load()).toEqual(defaults)
    })
  })

  describe('save()', () => {
    it('calls writeFileSync', () => {
      const cfg = { ...defaults, workingMode: 'ollama' as const }
      helper.save(cfg)
      expect(fs.writeFileSync).toHaveBeenCalled()
    })
  })
})
