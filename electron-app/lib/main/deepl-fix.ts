import { Translator, TargetLanguageCode } from 'deepl-node'
import type { FixTextFn } from '@/lib/main/types'

export const fixTextFactory = (apiKey: string) => {
  const translator = new Translator(apiKey)

  const fixText: FixTextFn = async (text, targetLang = 'de') => {
    console.log('fixing text with deepl')
    const langs = (['en-US', 'de'] as TargetLanguageCode[]).filter((lang) => lang !== targetLang)
    langs.push(targetLang)

    let fixedText = text
    for (const lang of langs) {
      const result = await translator.translateText(fixedText, null, lang)
      fixedText = result.text
    }

    return fixedText
  }

  return fixText
}
