import { Alert, Select, Stack, Title, Text, Code, type StackProps } from '@mantine/core'
import { useEffect } from 'react'
import { GoAlert } from 'react-icons/go'
import { useInputFocus } from '@/lib/frontend/hooks/useInputFocus'
import { useBackendStore } from '@/lib/frontend/stores/backend-store'

type Props = {
  selectedModel: string | null
  setSelectedModel: (model: string | null) => void
} & StackProps

export const OllamaConfigManager = ({ selectedModel, setSelectedModel, ...props }: Props) => {
  const ollamaModels = useBackendStore((store) => store.ollamaModels)
  const ollamaError = useBackendStore((store) => store.ollamaError)
  const isLoadingOllamaModels = useBackendStore((store) => store.isLoadingOllamaModels)
  const fetchOllamaModels = useBackendStore((store) => store.fetchOllamaModels)

  const modelSelectorRef = useInputFocus<HTMLInputElement>('focus-model-selector')

  useEffect(() => {
    fetchOllamaModels()
  }, [])

  return (
    <Stack gap="sm" {...props}>
      {ollamaError ? (
        <Alert color="orange" icon={<GoAlert />}>
          <Text>Seems like Ollama is not running. Please start it first.</Text>
        </Alert>
      ) : (
        <>
          <Title order={3}>Select one of the available models</Title>
          <Select
            ref={modelSelectorRef}
            data={ollamaModels}
            value={selectedModel}
            onChange={setSelectedModel}
            clearable
            disabled={isLoadingOllamaModels}
          />

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
