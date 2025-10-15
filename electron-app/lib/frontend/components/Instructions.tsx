import { Box, Group, Kbd, List, Stack, ThemeIcon, Title } from '@mantine/core'
import { AnimatePresence, motion } from 'motion/react'
import { FaCheck, FaTimesCircle, FaKeyboard } from 'react-icons/fa'
import { useBackendStore } from '@/lib/frontend/stores/backend-store'

export const Instructions = () => {
  const { workingMode, deeplApiKeySaved, ollamaModelSelected, openAIApiKeySaved } = useBackendStore()

  const readyToFix =
    (workingMode === 'deepl' && deeplApiKeySaved) ||
    (workingMode === 'ollama' && ollamaModelSelected) ||
    (workingMode === 'chatgpt' && openAIApiKeySaved)

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <FaKeyboard size={24} color="#eee" />
        <Title order={3}>How to use</Title>
      </Group>

      <List size="lg" withPadding icon={<Icon completed={readyToFix} />}>
        <List.Item pos="relative" pl={20}>
          <Kbd size="md">F9</Kbd> to fix current line
        </List.Item>
        <List.Item pos="relative" pl={20}>
          <Kbd size="md">F10</Kbd> to fix selection
        </List.Item>
      </List>
    </Stack>
  )
}

const Icon = ({ completed }: { completed: boolean }) => {
  return (
    <Box>
      <AnimatePresence mode="popLayout">
        {completed && (
          <motion.div
            key="completed"
            initial={{ y: -30, scale: 0, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -30, scale: 0, opacity: 0 }}
          >
            <ThemeIcon color="teal" size={24} radius="xl">
              <FaCheck size={16} />
            </ThemeIcon>
          </motion.div>
        )}
        {!completed && (
          <motion.div
            key="not-completed"
            initial={{ y: 30, scale: 0, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0, opacity: 0 }}
          >
            <ThemeIcon color="red" size={24} radius="xl">
              <FaTimesCircle size={16} />
            </ThemeIcon>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
