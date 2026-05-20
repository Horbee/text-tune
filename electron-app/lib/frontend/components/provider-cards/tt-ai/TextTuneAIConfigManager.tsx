import {
  Stack,
  Title,
  StackProps,
  Group,
  Card,
  Text,
  Button,
  Badge,
  TextInput,
  ActionIcon,
  Flex,
  Paper,
} from '@mantine/core'
import { FaDownload, FaCheck, FaTrashAlt } from 'react-icons/fa'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { useInputFocus } from '@/lib/frontend/hooks/useInputFocus'
import { hasLength, useForm } from '@mantine/form'
import { ConfirmDownloadModal } from './ConfirmDownloadModal'
import { DownloadProgress } from './DownloadProgress'
import { ModelStatus } from './ModelStatus'
import { useDisclosure } from '@mantine/hooks'

type Props = {
  selectedModel: string
  setSelectedModel: (model: string) => void
  modelDownloaded: boolean
  modelDownloadProgress: number | null
  isDownloading: boolean
  downloadModel: () => Promise<void>
  deleteModel: () => Promise<void>
  textTuneServerUrl: string | null
  saveTextTuneServerUrl: (url: string) => Promise<void>
  deleteTextTuneServerUrl: () => Promise<void>
} & StackProps

const selectedCardStyle = {
  border: '1px solid var(--mantine-color-blue-5)',
  backgroundColor: 'rgba(59, 130, 246, 0.12)',
  backdropFilter: 'blur(10px)',
  cursor: 'default',
  transition: 'opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
}

const unselectedCardStyle = {
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  cursor: 'pointer',
  opacity: 0.5,
  transition: 'opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
}

export const TextTuneAIConfigManager = ({
  selectedModel,
  setSelectedModel,
  modelDownloaded,
  modelDownloadProgress,
  isDownloading,
  downloadModel,
  deleteModel,
  textTuneServerUrl,
  saveTextTuneServerUrl,
  deleteTextTuneServerUrl,
  ...props
}: Props) => {
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false)
  const urlInputRef = useInputFocus<HTMLInputElement>('focus-text-tune-url-input')

  const form = useForm({
    mode: 'controlled',
    initialValues: { serverUrl: '' },
    validate: {
      serverUrl: hasLength({ min: 1 }, 'Must be at least 1 character'),
    },
  })

  const submitUrl = (values: typeof form.values) => {
    saveTextTuneServerUrl(values.serverUrl)
    form.reset()
  }

  const isSmallSelected = selectedModel === 'Text-Tune-Small'
  const isBaseSelected = !isSmallSelected
  const urlSaved = !!textTuneServerUrl

  const baseCardContent = () => {
    if (!isBaseSelected) {
      return (
        <Text size="sm" c="dimmed">
          {urlSaved ? `Server: ${textTuneServerUrl}` : 'No server configured'}
        </Text>
      )
    }

    if (urlSaved) {
      return (
        <Paper bg="var(--mantine-color-green-light)" p="md" withBorder bd="1px solid green.9">
          <Flex gap="md" align="center" wrap="wrap">
            <IoMdCheckmarkCircleOutline size={24} color="var(--mantine-color-green-6)" />
            <Stack gap="0">
              <Text fw={700} c="green.3">
                Connected to {textTuneServerUrl}
              </Text>
              <Text c="green.6" size="sm">
                You can now use the remote model.
              </Text>
            </Stack>
            <Button
              variant="outline"
              size="compact-sm"
              color="red"
              ml="auto"
              onClick={(e) => {
                e.stopPropagation()
                deleteTextTuneServerUrl()
              }}
              leftSection={<FaTrashAlt />}
            >
              Delete URL
            </Button>
          </Flex>
        </Paper>
      )
    }

    return (
      <form
        onSubmit={(e) => {
          e.stopPropagation()
          form.onSubmit(submitUrl)(e)
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <Group align="end" gap="xs">
          <TextInput
            ref={urlInputRef}
            label="Server URL"
            placeholder="http://localhost:3000"
            flex="1"
            {...form.getInputProps('serverUrl')}
          />
          <ActionIcon type="submit" size={36}>
            <FaCheck />
          </ActionIcon>
        </Group>
      </form>
    )
  }

  return (
    <Stack gap="sm" {...props}>
      <Title order={3}>Text Tune AI Models</Title>

      <Group align="stretch" grow>
        <Card
          onClick={() => {
            if (!isSmallSelected) setSelectedModel('Text-Tune-Small')
          }}
          style={isSmallSelected ? selectedCardStyle : unselectedCardStyle}
          p="md"
          radius="md"
        >
          <Stack gap="sm">
            <Group gap="xs">
              <Title order={4}>Text-Tune-Small</Title>
              <Badge size="sm" variant="light">
                Local
              </Badge>
            </Group>

            {modelDownloaded ? (
              <ModelStatus onDelete={deleteModel} />
            ) : isDownloading && modelDownloadProgress !== null ? (
              <DownloadProgress percentage={modelDownloadProgress} />
            ) : (
              <>
                <Text size="sm" c="dimmed">
                  Runs locally on your machine. Download once, use offline.
                </Text>
                <Button
                  leftSection={<FaDownload />}
                  onClick={(e) => {
                    e.stopPropagation()
                    openConfirm()
                  }}
                  variant="outline"
                >
                  Download Model
                </Button>
              </>
            )}
          </Stack>
        </Card>

        <Card
          onClick={() => {
            if (isSmallSelected) setSelectedModel('Text-Tune-Base-v13')
          }}
          style={isBaseSelected ? selectedCardStyle : unselectedCardStyle}
          p="md"
          radius="md"
        >
          <Stack gap="sm">
            <Group gap="xs">
              <Title order={4}>Text-Tune-Base</Title>
              <Badge size="sm" variant="light">
                Online
              </Badge>
            </Group>
            {baseCardContent()}
          </Stack>
        </Card>
      </Group>

      <ConfirmDownloadModal
        opened={confirmOpened}
        onClose={closeConfirm}
        onConfirm={() => {
          closeConfirm()
          downloadModel()
        }}
      />
    </Stack>
  )
}
