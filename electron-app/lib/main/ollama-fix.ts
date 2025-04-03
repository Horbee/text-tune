import axios from 'axios'
import type { FixTextFn } from '@/lib/main/types'

const OLLAMA_ENDPOINT = 'http://localhost:11434'

const getPromptTemplate = (text: string) => {
  return `Fix all typos and casing and punctuation in this text and make it grammatically correct, but keep the source language:

  ${text}

  Return only the corrected text, don't include a preamble.
  `
}

export const fixTextFactory = (model: string) => {
  const fixText: FixTextFn = async (text) => {
    console.log('fixing text with ollama')
    const response = await axios.post(
      `${OLLAMA_ENDPOINT}/api/generate`,
      {
        model,
        prompt: getPromptTemplate(text),
        keep_alive: '5m',
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return response.data.response.trim()
  }

  return fixText
}
