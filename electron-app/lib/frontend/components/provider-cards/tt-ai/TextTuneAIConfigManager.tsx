import { Stack, Title, StackProps, Group, Card, Text, Button, Badge } from '@mantine/core'
import { FaDownload } from 'react-icons/fa'
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
  ...props
}: Props) => {
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false)

  const isSmallSelected = selectedModel === 'Text-Tune-Small'

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
            if (isSmallSelected) setSelectedModel('Text-Tune-Base')
          }}
          style={!isSmallSelected ? selectedCardStyle : unselectedCardStyle}
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
            <Text size="sm" c="dimmed">
              Coming Soon
            </Text>
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
