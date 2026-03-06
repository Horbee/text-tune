import { Text, Box, Paper, Flex, darken, Badge, Divider } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useHover } from '@mantine/hooks'
import { motion } from 'motion/react'
import { getServiceByValue } from '@/lib/frontend/utils/services'
import type { HistoryItem } from '@/lib/main/types'

interface Props {
  item: HistoryItem
}

const HISTORY_ICON_SIZE = 18

export const FixHistoryItem = ({ item }: Props) => {
  const { hovered, ref } = useHover()

  const handleCopyTextToClipboard = async () => {
    if (!item.fixedText) return

    await navigator.clipboard.writeText(item.fixedText)
    showNotification({
      withBorder: true,
      message: 'Text copied to clipboard',
      color: 'green',
    })
  }

  const isComplete = !!item.fixedText

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Paper
        ref={ref}
        radius="md"
        p={0}
        withBorder
        style={{
          cursor: hovered ? 'pointer' : 'auto',
          boxShadow: hovered ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 1px 4px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.2s ease',
          overflow: 'hidden',
          borderColor: isComplete ? 'var(--mantine-color-green-8)' : 'var(--mantine-color-orange-7)',
        }}
        onClick={handleCopyTextToClipboard}
      >
        {/* Gradient accent strip */}
        <Box
          h={4}
          style={{
            background: isComplete
              ? 'linear-gradient(90deg, var(--mantine-color-green-6), var(--mantine-color-teal-9))'
              : 'linear-gradient(90deg, var(--mantine-color-orange-6), var(--mantine-color-yellow-5))',
          }}
        />

        <Box
          p="md"
          bg={
            hovered
              ? isComplete
                ? 'var(--mantine-color-dark-6)'
                : darken('var(--mantine-color-orange-light)', 0.1)
              : isComplete
                ? 'var(--mantine-color-dark-7)'
                : 'var(--mantine-color-orange-light)'
          }
        >
          {/* Fixed text — primary content */}
          {item.isFixing ? (
            <Text size="sm" c="orange.4" fs="italic">
              Fixing in progress…
            </Text>
          ) : (
            <Text size="md" fw={600} c={isComplete ? 'green.3' : 'orange.2'} lh={1.5}>
              {item.fixedText}
            </Text>
          )}

          {/* Original text — secondary, de-emphasised */}
          <Text size="xs" c="dimmed" mt={6} lh={1.4} fs="italic">
            {item.originalText}
          </Text>

          <Divider my="xs" color={isComplete ? 'green.9' : 'orange.9'} opacity={0.4} />

          {/* Meta row — model + provider */}
          <Flex gap="xs" align="center">
            <Badge
              size="xs"
              variant="gradient"
              gradient={
                isComplete ? { from: 'green.5', to: 'teal', deg: 90 } : { from: 'orange', to: 'yellow', deg: 90 }
              }
              radius="sm"
            >
              {item.model.toUpperCase()}
            </Badge>

            {item.usedProvider && (
              <Box ml="auto" style={{ display: 'flex', opacity: 0.75 }}>
                {getServiceByValue(item.usedProvider)?.icon(HISTORY_ICON_SIZE)}
              </Box>
            )}
          </Flex>
        </Box>
      </Paper>
    </motion.div>
  )
}
