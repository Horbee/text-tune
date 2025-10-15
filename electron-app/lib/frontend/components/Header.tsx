import { ActionIcon, Box, Flex, Image, Text } from '@mantine/core'
import { IoMdMenu } from 'react-icons/io'
import { useDrawerStore } from '@/lib/frontend/stores/drawer-store'

import appIcon from '@/resources/build/icon.png?asset'

export function Header() {
  const { toggleDrawer } = useDrawerStore()

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

        <ActionIcon
          display={{ base: 'block', md: 'none' }}
          variant="outline"
          ml="auto"
          size="lg"
          color="gray"
          onClick={toggleDrawer}
        >
          <IoMdMenu size={24} color="#eee" />
        </ActionIcon>
      </Flex>
    </Box>
  )
}
