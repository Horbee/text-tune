import { Alert, Select, Stack, Title, Text, Code, type StackProps } from '@mantine/core'
import axios from 'axios'
import { useRef, useState } from 'react'
import { useEffect } from 'react'
import { GoAlert } from 'react-icons/go'

type Props = {
  selectedModel: string | null
  setSelectedModel: (model: string | null) => void
} & StackProps

export const OllamaConfigManager = ({ selectedModel, setSelectedModel, ...props }: Props) => {
  const [models, setModels] = useState<string[]>([])
  const [ollamaError, setOllamaError] = useState(false)

  const modelSelectorRef = useRef<HTMLInputElement>(null)

  const getOllamaData = async () => {
    // Check if ollama is running
    try {
      await axios.get('http://localhost:11434')

      // Get models
      const res = await axios.get('http://localhost:11434/api/tags')
      setModels(res.data.models.map((model: any) => model.name))
    } catch (error) {
      setOllamaError(true)
    }
  }

  useEffect(() => {
    getOllamaData()
  }, [])

  useEffect(() => {
    const unsub = window.api.receive('message-from-main', (args) => {
      if (args.type === 'FOCUS_MODEL_SELECTOR') {
        modelSelectorRef.current?.focus()
      }
    })

    return () => unsub()
  }, [])

  return (
    <Stack gap="sm" {...props}>
      {ollamaError ? (
        <Alert color="orange" icon={<GoAlert />}>
          <Text>Seems like Ollama is not running. Please start it first.</Text>
        </Alert>
      ) : (
        <>
          <Title order={2}>Select one of the available models</Title>
          <Select ref={modelSelectorRef} data={models} value={selectedModel} onChange={setSelectedModel} clearable />

          <Alert>
            <Text>
              If you don't see your desired model, you can pull it: <br />
              <Code>ollama pull llama3.2</Code>
            </Text>
          </Alert>
        </>
      )}
    </Stack>
  )
}
