import { ActionIcon, Box, Button, Flex, Image, Text, Tooltip } from '@mantine/core'
import { IoMdMenu, IoMdLogOut } from 'react-icons/io'
import { useAuthStore } from '@/lib/frontend/stores/auth-store'
import { useDrawerStore } from '@/lib/frontend/stores/drawer-store'

import appIcon from '@/resources/build/icon.png?asset'

export function Header() {
  const { toggleDrawer } = useDrawerStore()
  const { user, signOut } = useAuthStore()

  return (
    <Box
      style={(theme) => ({
        borderBottom: `1px solid ${theme.colors.gray[8]}`,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
      })}
    >
      <Flex align="center" gap="md" px="xl" py="lg">
        <Image src={appIcon} alt="Text Tune" w={36} h={36} fit="cover" />
        <Text size="xl" fw={600} variant="gradient" gradient={{ from: 'gray.3', to: 'gray.1', deg: 90 }}>
          Text Tune
        </Text>

        <Flex align="center" gap="sm" ml="auto">
          {!user && (
            <Button variant="outline" onClick={() => window.requestAuth()}>
              Sign in
            </Button>
          )}

          {user && (
            <>
              <Text size="sm" c="dimmed" visibleFrom="xs">
                {user.email}
              </Text>
              <Tooltip label="Sign out" withArrow>
                <ActionIcon variant="subtle" size="lg" color="gray" onClick={signOut}>
                  <IoMdLogOut size={20} />
                </ActionIcon>
              </Tooltip>
            </>
          )}

          <ActionIcon
            display={{ base: 'block', md: 'none' }}
            variant="outline"
            size="lg"
            color="gray"
            onClick={toggleDrawer}
          >
            <IoMdMenu size={24} color="#eee" />
          </ActionIcon>
        </Flex>
      </Flex>
    </Box>
  )
}
