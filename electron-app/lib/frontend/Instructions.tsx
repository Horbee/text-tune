import { Box, List, Stack, ThemeIcon, Title } from '@mantine/core'
import { AnimatePresence, motion } from 'framer-motion'
import { FaCheck, FaTimesCircle } from 'react-icons/fa'

export const Instructions = ({ readyToFix }: { readyToFix: boolean }) => {
  return (
    <Stack gap="sm">
      <Title order={2}>How to use</Title>

      <List size="lg" withPadding icon={<Icon completed={readyToFix} />}>
        <List.Item pos="relative" pl={20}>
          <b>F9</b> to fix current line
        </List.Item>
        <List.Item pos="relative" pl={20}>
          <b>F10</b> to fix selection
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
