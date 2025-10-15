import { Text, Box, Paper, Flex, darken } from '@mantine/core'
import { SiDeepl, SiOpenai, SiOllama } from 'react-icons/si'
import { showNotification } from '@mantine/notifications'
import { useHover } from '@mantine/hooks'
import { motion } from 'motion/react'
import type { HistoryItem } from '@/lib/main/types'

interface Props {
  item: HistoryItem
}

const providerIcons = {
  deepl: <SiDeepl fontSize={20} />,
  ollama: <SiOllama fontSize={20} />,
  chatgpt: <SiOpenai fontSize={20} />,
}

export const FixHistoryItem = ({ item }: Props) => {
  const { hovered, ref } = useHover()

  const isFix = item.type === 'fix'

  const handleCopyTextToClipboard = async () => {
    await navigator.clipboard.writeText(item.text)
    showNotification({
      withBorder: true,
      message: 'Text copied to clipboard',
      color: 'green',
    })
  }

  const bgColor = isFix ? 'var(--mantine-color-gray-light)' : 'var(--mantine-color-orange-light)'

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Paper
        ref={ref}
        bg={hovered ? darken(bgColor, 0.1) : bgColor}
        radius="md"
        p="md"
        withBorder
        style={{ cursor: hovered ? 'pointer' : 'auto', boxShadow: hovered ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none' }}
        onClick={handleCopyTextToClipboard}
      >
        <Flex gap="xs" align="center">
          <Paper w={10} h={10} bg={isFix ? 'gray.6' : 'orange'} radius="lg" />

          <Text fw={600} size="sm" c={isFix ? 'gray.3' : 'orange.3'}>
            {item.type.toUpperCase()}
          </Text>

          {item.usedProvider && <Box ml="auto">{providerIcons[item.usedProvider]}</Box>}
        </Flex>
        <Text size="sm" fw={700} c={isFix ? 'gray.3' : 'orange.2'} mt="xs">
          {item.text}
        </Text>
      </Paper>
    </motion.div>
  )
}
