import { useEffect } from 'react'
import { Grid, Stack, SegmentedControl } from '@mantine/core'
import { showNotification } from '@mantine/notifications'

import { DeeplConfigManager } from './DeeplConfigManager'
import { Instructions } from './Instructions'
import { FixHistoryContainer } from './FixHistoryContainer'
import { OllamaConfigManager } from './OllamaConfigManager'
import { ChatGPTConfigManager } from './ChatGPTConfigManager'
import { useFrontendStore } from './stores/frontend-store'
import { AnimatePresence, motion } from 'framer-motion'

const MotionDeeplConfigManager = motion(DeeplConfigManager)
const MotionOllamaConfigManager = motion(OllamaConfigManager)
const MotionChatGPTConfigManager = motion(ChatGPTConfigManager)

const MotionInstructions = motion(Instructions)

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
  const {
    initStore,
    workingMode,
    setWorkingMode,
    setupListeners,
    cleanupListeners,
    // Configs
    deeplApiKeySaved,
    ollamaModelSelected,
    openAIApiKeySaved,
    // Ollama
    selectedOllamaModel,
    setSelectedOllamaModel,
    // OpenAI
    selectedOpenAIModel,
    setSelectedOpenAIModel,
    saveOpenAIApiKey,
    deleteOpenAIApiKey,
    // DeepL
    saveDeeplApiKey,
    deleteDeeplApiKey,
  } = useFrontendStore()

  useEffect(() => {
    initStore()

    setupListeners()

    return () => {
      cleanupListeners()
    }
  }, [])

  const readyToFix =
    (workingMode === 'deepl' && deeplApiKeySaved) ||
    (workingMode === 'ollama' && ollamaModelSelected) ||
    (workingMode === 'chatgpt' && openAIApiKeySaved)

  return (
    <Grid p="lg">
      <Grid.Col span={5} p="lg">
        <Stack gap="xl">
          <SegmentedControl
            value={workingMode}
            onChange={(value) => setWorkingMode(value as 'deepl' | 'ollama')}
            data={[
              { label: 'DeepL', value: 'deepl' },
              { label: 'Ollama', value: 'ollama' },
              { label: 'ChatGPT', value: 'chatgpt' },
            ]}
          />

          <AnimatePresence mode="popLayout">
            {workingMode === 'deepl' && (
              <MotionDeeplConfigManager
                key="deepl-config"
                apiKeySaved={deeplApiKeySaved}
                saveApiKey={saveDeeplApiKey}
                deleteApiKey={deleteDeeplApiKey}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
              />
            )}

            {workingMode === 'ollama' && (
              <MotionOllamaConfigManager
                key="ollama-config"
                selectedModel={selectedOllamaModel}
                setSelectedModel={setSelectedOllamaModel}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
              />
            )}

            {workingMode === 'chatgpt' && (
              <MotionChatGPTConfigManager
                key="chatgpt-config"
                selectedModel={selectedOpenAIModel}
                setSelectedModel={setSelectedOpenAIModel}
                apiKeySaved={openAIApiKeySaved}
                saveApiKey={saveOpenAIApiKey}
                deleteApiKey={deleteOpenAIApiKey}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <motion.div layout>
            <MotionInstructions layout readyToFix={readyToFix} />
          </motion.div>
        </Stack>
      </Grid.Col>
      <Grid.Col span={7} p="lg">
        <FixHistoryContainer />
      </Grid.Col>
    </Grid>
  )
}

export default App
