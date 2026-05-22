import { useState } from 'react'
import { Box, Button, Flex, Image, Paper, Stack, Text, Title } from '@mantine/core'
import { useAuthStore } from '@/lib/frontend/stores/auth-store'

import appIcon from '@/resources/build/icon.png'

export function LoginScreen() {
  const { requestAuth } = useAuthStore()
  const [requested, setRequested] = useState(false)

  const handleSignIn = async () => {
    setRequested(true)
    try {
      await requestAuth()
    } catch {
      setRequested(false)
    }
  }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper
        w={{ base: '90%', xs: 420 }}
        p="xl"
        radius="lg"
        style={(theme) => ({
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: `1px solid ${theme.colors.gray[8]}`,
          backdropFilter: 'blur(12px)',
        })}
      >
        <Stack gap="lg" align="center">
          <Flex align="center" gap="md">
            <Image src={appIcon} alt="Text Tune" w={48} h={48} fit="cover" />
            <Title order={2} fw={600}>
              Text Tune
            </Title>
          </Flex>

          {requested ? (
            <Stack gap="xs" align="center">
              <Title order={4} ta="center">
                Browser window opened
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Complete the sign-in process in your browser. This window will update automatically.
              </Text>
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                mt="xs"
                onClick={() => setRequested(false)}
              >
                Re-open sign-in page
              </Button>
            </Stack>
          ) : (
            <Stack gap="xs" w="100%">
              <Title order={4} ta="center">
                Sign in to your account
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                A sign-in page will open in your browser
              </Text>
              <Button
                size="md"
                radius="md"
                fullWidth
                mt="xs"
                onClick={handleSignIn}
                style={(theme) => ({
                  backgroundColor: theme.colors.gray[2],
                  color: theme.colors.dark[9],
                })}
                styles={{ label: { fontWeight: 600 } }}
              >
                Sign In
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}
