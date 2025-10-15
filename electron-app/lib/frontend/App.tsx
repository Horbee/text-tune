import { useEffect } from 'react'
import { Drawer, Grid, Group, Stack, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { motion } from 'motion/react'

import { Instructions, FixHistoryContainer, Header, ServiceCards } from '@/lib/frontend/components'
import { useBackendStore } from '@/lib/frontend/stores/backend-store'
import { useDrawerStore } from '@/lib/frontend/stores/drawer-store'
import { MdOutlineAutoAwesome } from 'react-icons/md'

const MotionInstructions = motion.create(Instructions)

export const showErrorNotification = (title: string, message: string) => {
  showNotification({
    withBorder: true,
    title,
    message,
    color: 'red',
    autoClose: false,
  })
}

function App() {
  const { initStore, setupListeners, cleanupListeners } = useBackendStore()
  const { drawerOpen, setDrawerOpen } = useDrawerStore()

  useEffect(() => {
    initStore()

    setupListeners()

    return () => {
      cleanupListeners()
    }
  }, [])

  return (
    <>
      <Header />
      <Grid gutter={0}>
        <Grid.Col span={{ base: 12, md: 8 }} p="lg">
          <Stack>
            <ServiceCards />

            <motion.div layout>
              <MotionInstructions layout />
            </motion.div>
          </Stack>
        </Grid.Col>
        <Grid.Col
          display={{ base: 'none', md: 'block' }}
          span={4}
          p="lg"
          pr="0"
          h="calc(100vh - 77px)"
          style={(theme) => ({
            borderLeft: `1px solid ${theme.colors.gray[8]}`,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
          })}
        >
          <FixHistoryContainer />
        </Grid.Col>
      </Grid>
      <Drawer
        display={{ base: 'block', md: 'none' }}
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        size="sm"
        title={
          <Group gap="xs">
            <MdOutlineAutoAwesome size={24} color="#eee" />
            <Title order={3}>History</Title>
          </Group>
        }
      >
        <FixHistoryContainer hideTitle />
      </Drawer>
    </>
  )
}

export default App
