import { Stack, Title, Flex, Group, ScrollArea } from '@mantine/core'
import { motion } from 'motion/react'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import { useBackendStore } from '@/lib/frontend/stores/backend-store'
import { FixHistoryItem } from '@/lib/frontend/components'

export function FixHistoryContainer({ hideTitle }: { hideTitle?: boolean }) {
  const fixHistory = useBackendStore((store) => store.fixHistory)
  const reversedHistory = [...fixHistory].reverse()

  const scrollAreaHeight = hideTitle ? 'calc(100vh - 80px)' : 'calc(100vh - 150px)'

  return (
    <Stack gap="sm">
      {!hideTitle && (
        <Group gap="xs">
          <MdOutlineAutoAwesome size={24} color="#eee" />
          <Title order={3}>History</Title>
        </Group>
      )}
      <ScrollArea h={scrollAreaHeight} offsetScrollbars scrollHideDelay={0}>
        <Flex direction="column-reverse" gap="sm" p="4px">
          {reversedHistory.map((item) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.type === 'fix' ? 0.2 : 0 }}
              key={item.id}
            >
              <FixHistoryItem item={item} />
            </motion.div>
          ))}
        </Flex>
      </ScrollArea>
    </Stack>
  )
}
