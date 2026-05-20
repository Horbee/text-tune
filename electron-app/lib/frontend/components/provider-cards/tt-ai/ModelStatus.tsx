import { Button, Stack, Text, Flex, Paper } from '@mantine/core'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { FaTrashAlt } from 'react-icons/fa'

type Props = {
  onDelete: () => void
}

export const ModelStatus = ({ onDelete }: Props) => {
  return (
    <Paper bg="var(--mantine-color-green-light)" p="md" withBorder bd="1px solid green.9">
      <Flex gap="md" align="center" wrap="wrap">
        <IoMdCheckmarkCircleOutline size={24} color="var(--mantine-color-green-6)" />
        <Stack gap="0">
          <Text fw={700} c="green.3">
            Model is ready
          </Text>
          <Text c="green.6" size="sm">
            The local model is downloaded and ready to use.
          </Text>
        </Stack>
        <Button
          variant="outline"
          size="compact-sm"
          color="red"
          ml="auto"
          onClick={onDelete}
          leftSection={<FaTrashAlt />}
        >
          Delete &amp; Redownload
        </Button>
      </Flex>
    </Paper>
  )
}
