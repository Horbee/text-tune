import { Modal, Button, Text, Group, Stack } from '@mantine/core'
import { FaDownload } from 'react-icons/fa'

type Props = {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmDownloadModal = ({ opened, onClose, onConfirm }: Props) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Download Model" centered>
      <Stack gap="md">
        <Text>
          Text Tune needs to download the local model file (approximately <strong>2 GB</strong>) before it can be used.
        </Text>
        <Text size="sm" c="dimmed">
          The download may take several minutes depending on your internet connection. The model will be cached for future use.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button leftSection={<FaDownload />} onClick={onConfirm}>
            Yes, download model
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
