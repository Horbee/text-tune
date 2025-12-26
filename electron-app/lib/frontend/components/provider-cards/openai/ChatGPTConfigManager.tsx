import {
  Select,
  Stack,
  Title,
  Text,
  type StackProps,
  PasswordInput,
  Button,
  Flex,
  Paper,
  ActionIcon,
  Group,
} from '@mantine/core'
import { hasLength, useForm } from '@mantine/form'
import { useEffect } from 'react'
import { FaTrashAlt, FaCheck } from 'react-icons/fa'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { useInputFocus } from '@/lib/frontend/hooks/useInputFocus'

type Props = {
  selectedModel: string | null
  setSelectedModel: (model: string | null) => void
  apiKeySaved: boolean
  saveApiKey: (apiKey: string) => Promise<void>
  deleteApiKey: () => void
} & StackProps

const CHATGPT_MODELS = ['gpt-5-nano', 'gpt-5-mini', 'gpt-5']

export const ChatGPTConfigManager = ({
  selectedModel,
  setSelectedModel,
  saveApiKey,
  deleteApiKey,
  apiKeySaved,
  ...props
}: Props) => {
  const apiKeyInputRef = useInputFocus<HTMLInputElement>('focus-api-key-input')
  const modelSelectorRef = useInputFocus<HTMLInputElement>('focus-model-selector')

  const form = useForm({
    mode: 'controlled',
    initialValues: { apiKey: '' },
    validate: {
      apiKey: hasLength({ min: 1 }, 'Must be at least 1 character'),
    },
  })

  const submit = (values: typeof form.values) => {
    saveApiKey(values.apiKey.trim())
    form.reset()
  }

  useEffect(() => {
    // Set default model if none selected
    if (!selectedModel || !CHATGPT_MODELS.includes(selectedModel)) {
      setSelectedModel(CHATGPT_MODELS[0]) // gpt-5-nano as default
    }
  }, [selectedModel, setSelectedModel])

  return (
    <Stack gap="sm" {...props}>
      <Title order={3}>ChatGPT Configuration</Title>

      {apiKeySaved && (
        <Select
          ref={modelSelectorRef}
          label="Model"
          data={CHATGPT_MODELS}
          value={selectedModel}
          onChange={setSelectedModel}
          description="Select the ChatGPT model to use"
        />
      )}

      {!apiKeySaved ? (
        <form onSubmit={form.onSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Group align="end" gap="xs">
            <PasswordInput
              ref={apiKeyInputRef}
              label="API Key"
              placeholder="Enter your API key"
              flex="1"
              {...form.getInputProps('apiKey')}
            />

            <ActionIcon type="submit" size="36">
              <FaCheck />
            </ActionIcon>
          </Group>
        </form>
      ) : (
        <Paper bg="var(--mantine-color-green-light)" p="md" withBorder bd="1px solid green.9">
          <Flex gap="md" align="center" wrap="wrap">
            <IoMdCheckmarkCircleOutline size={24} color="var(--mantine-color-green-6)" />
            <Stack gap="0">
              <Text fw={700} c="green.3">
                Your API Key is saved
              </Text>
              <Text c="green.6" size="sm">
                You can now select a model and use the extension.
              </Text>
            </Stack>
            <Button
              variant="outline"
              size="compact-sm"
              color="red"
              ml="auto"
              onClick={deleteApiKey}
              leftSection={<FaTrashAlt />}
            >
              Delete API Key
            </Button>
          </Flex>
        </Paper>
      )}
    </Stack>
  )
}
