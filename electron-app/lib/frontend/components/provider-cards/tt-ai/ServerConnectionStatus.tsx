import { Paper, Flex, Stack, Button, Text, Loader } from '@mantine/core'
import { useEffect, useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { MdErrorOutline } from 'react-icons/md'
import axios from 'axios'

type Props = {
  textTuneServerUrl: string | null
  deleteTextTuneServerUrl: () => Promise<void>
}

type ServerStatus = 'loading' | 'success' | 'error'

export const ServerConnectionStatus = ({ textTuneServerUrl, deleteTextTuneServerUrl }: Props) => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('loading')

  useEffect(() => {
    if (!textTuneServerUrl) return

    setServerStatus('loading')

    axios
      .get(textTuneServerUrl)
      .then(() => {
        setServerStatus('success')
      })
      .catch((error) => {
        console.error(`Text Tune server is unreachable at ${textTuneServerUrl}:`, error)
        setServerStatus('error')
      })
  }, [textTuneServerUrl])

  // Loading state - yellow
  if (serverStatus === 'loading') {
    return (
      <Paper bg="var(--mantine-color-yellow-light)" p="md" withBorder bd="1px solid var(--mantine-color-yellow-6)">
        <Flex gap="md" align="center" wrap="wrap">
          <Loader size={24} color="yellow.6" />
          <Stack gap="0">
            <Text fw={700} c="yellow.8">
              Connecting to server...
            </Text>
            <Text c="yellow.7" size="sm">
              {textTuneServerUrl}
            </Text>
          </Stack>
        </Flex>
      </Paper>
    )
  }

  // Error state - red/orange
  if (serverStatus === 'error') {
    return (
      <Paper bg="var(--mantine-color-red-light)" p="md" withBorder bd="1px solid var(--mantine-color-red-6)">
        <Flex gap="md" align="center" wrap="wrap">
          <MdErrorOutline size={24} color="var(--mantine-color-red-6)" />
          <Stack gap="0">
            <Text fw={700} c="red.7">
              Server is not reachable
            </Text>
            <Text c="red.6" size="sm">
              {textTuneServerUrl}
            </Text>
          </Stack>
          <Button
            variant="outline"
            size="compact-sm"
            color="red"
            ml="auto"
            onClick={deleteTextTuneServerUrl}
            leftSection={<FaTrashAlt />}
          >
            Delete
          </Button>
        </Flex>
      </Paper>
    )
  }

  // Success state - green
  return (
    <Paper bg="var(--mantine-color-green-light)" p="md" withBorder bd="1px solid var(--mantine-color-green-6)">
      <Flex gap="md" align="center" wrap="wrap">
        <IoMdCheckmarkCircleOutline size={24} color="var(--mantine-color-green-6)" />
        <Stack gap="0">
          <Text fw={700} c="green.7">
            Your server address is saved
          </Text>
          <Text c="green.6" size="sm">
            {textTuneServerUrl}
          </Text>
        </Stack>
        <Button
          variant="outline"
          size="compact-sm"
          color="red"
          ml="auto"
          onClick={deleteTextTuneServerUrl}
          leftSection={<FaTrashAlt />}
        >
          Delete
        </Button>
      </Flex>
    </Paper>
  )
}
