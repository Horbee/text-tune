import { Paper, Box, Text, type BoxProps } from '@mantine/core'
import type { HistoryItem } from '@/lib/main/types'

interface Props extends BoxProps {
  item: HistoryItem
}

export const FixHistoryItem = ({ item, ...boxProps }: Props) => {
  return (
    <Box {...boxProps}>
      <Text size="xs">{item.type}</Text>
      <Paper shadow="sm" withBorder p="xs" radius="lg" bg={item.type === 'original' ? 'red.1' : 'blue.1'}>
        <Text>{item.text}</Text>
      </Paper>
    </Box>
  )
}
