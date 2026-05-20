import { Progress, Text, Stack } from '@mantine/core'

type Props = {
  percentage: number
}

export const DownloadProgress = ({ percentage }: Props) => {
  return (
    <Stack gap="xs">
      <Text size="sm" c="dimmed">
        Downloading model... {percentage}%
      </Text>
      <Progress value={percentage} animated striped size="md" />
    </Stack>
  )
}
