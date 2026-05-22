import { useEffect } from 'react'
import { Drawer, Grid, Group, Stack, Title } from '@mantine/core'
import { motion } from 'motion/react'

import { Instructions, FixHistoryContainer, Header, ProviderCards } from '@/lib/frontend/components'
import { LoginScreen } from '@/lib/frontend/components/auth/LoginScreen'
import { useAuthStore } from '@/lib/frontend/stores/auth-store'
import { useBackendStore } from '@/lib/frontend/stores/backend-store'
import { useDrawerStore } from '@/lib/frontend/stores/drawer-store'
import { MdOutlineAutoAwesome } from 'react-icons/md'

const MotionInstructions = motion.create(Instructions)

function App() {
  const { initStore, setupListeners, cleanupListeners } = useBackendStore()
  const { drawerOpen, setDrawerOpen } = useDrawerStore()
  const { user, isLoading, fetchSession } = useAuthStore()

  useEffect(() => {
    fetchSession()

    const onFocus = () => {
      if (!useAuthStore.getState().user) fetchSession()
    }
    window.addEventListener('focus', onFocus)

    // When the user clicks the magic link the main process authenticates and
    // fires this event with the resolved user – update the store immediately.
    const unsubAuthenticated = window.onAuthenticated(async (user) => {
      useAuthStore.setState({ user: user as ReturnType<typeof useAuthStore.getState>['user'], isLoading: false })
    })

    return () => {
      window.removeEventListener('focus', onFocus)
      unsubAuthenticated()
    }
  }, [])

  useEffect(() => {
    if (!user) return

    initStore()
    setupListeners()

    return () => {
      cleanupListeners()
    }
  }, [user])

  if (isLoading) {
    console.log('Loading session...')
    return null
  }

  if (!user) {
    console.log('No user found, redirecting to login...')
    return <LoginScreen />
  }

  console.log('User authenticated:', user)
  return (
    <>
      <Header />
      <Grid gutter={0}>
        <Grid.Col span={{ base: 12, md: 8 }} p="lg">
          <Stack>
            <ProviderCards />

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
