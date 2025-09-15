import { Stack, Title, Flex } from '@mantine/core'
import { motion } from 'framer-motion'
import { useFrontendStore } from './stores/frontend-store'
import { FixHistoryItem } from './FixHistoryItem'

export function FixHistoryContainer() {
  const fixHistory = useFrontendStore((store) => store.fixHistory)
  const reversedHistory = [...fixHistory].reverse()

  return (
    <Stack gap="sm">
      <Title order={2}>History</Title>
      <Flex direction="column-reverse" gap="sm" mah={500} style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        {reversedHistory.map((item) => (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.type === 'fix' ? 0.2 : 0 }}
            key={item.id}
          >
            <FixHistoryItem
              item={item}
              style={{
                alignSelf: item.type === 'fix' ? 'flex-end' : 'flex-start',
              }}
            />
          </motion.div>
        ))}
      </Flex>
    </Stack>
  )
}
