import { motion } from 'motion/react'
import { Card, Group, Tabs, Text } from '@mantine/core'

import { useBackendStore } from '@/lib/frontend/stores/backend-store'
import { ChatGPTConfigManager } from '@/lib/frontend/components/provider-cards/openai/ChatGPTConfigManager'
import { OllamaConfigManager } from '@/lib/frontend/components/provider-cards/ollama/OllamaConfigManager'
import { DeeplConfigManager } from '@/lib/frontend/components/provider-cards/deepl/DeeplConfigManager'
import { TextTuneAIConfigManager } from '@/lib/frontend/components/provider-cards/tt-ai/TextTuneAIConfigManager'
import { services } from '@/lib/frontend/utils/services'

import type { WorkingMode } from '@/lib/main/types'

const MotionDeeplConfigManager = motion.create(DeeplConfigManager)
const MotionOllamaConfigManager = motion.create(OllamaConfigManager)
const MotionChatGPTConfigManager = motion.create(ChatGPTConfigManager)
const MotionTextTuneAIConfigManager = motion.create(TextTuneAIConfigManager)

const TAB_ICON_SIZE = 24

export const ProviderCards = () => {
  const {
    workingMode,
    setWorkingMode,
    selectedOpenAIModel,
    setSelectedOpenAIModel,
    openAIApiKeySaved,
    saveOpenAIApiKey,
    deleteOpenAIApiKey,
    selectedOllamaModel,
    setSelectedOllamaModel,
    deeplApiKeySaved,
    saveDeeplApiKey,
    deleteDeeplApiKey,
    textTuneServerUrl,
    saveTextTuneServerUrl,
    deleteTextTuneServerUrl,
  } = useBackendStore()

  return (
    <Card
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
      p={0}
      radius="md"
      withBorder
    >
      <Tabs value={workingMode} onChange={(value) => setWorkingMode(value as WorkingMode)} keepMounted={false}>
        <Tabs.List grow>
          {services.map((service) => (
            <Tabs.Tab key={service.label} value={service.value} p="lg">
              <Group justify="center" gap="sm" c={workingMode === service.value ? 'white' : 'gray.4'}>
                {service.icon(TAB_ICON_SIZE)}
                <Text>{service.label}</Text>
              </Group>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="tt-ai" className="mt-0" p="lg">
          <MotionTextTuneAIConfigManager
            textTuneServerUrl={textTuneServerUrl}
            saveTextTuneServerUrl={saveTextTuneServerUrl}
            deleteTextTuneServerUrl={deleteTextTuneServerUrl}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="deepl" className="mt-0" p="lg">
          <MotionDeeplConfigManager
            apiKeySaved={deeplApiKeySaved}
            saveApiKey={saveDeeplApiKey}
            deleteApiKey={deleteDeeplApiKey}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="ollama" className="mt-0" p="lg">
          <MotionOllamaConfigManager
            selectedModel={selectedOllamaModel}
            setSelectedModel={setSelectedOllamaModel}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="chatgpt" className="mt-0" p="lg">
          <MotionChatGPTConfigManager
            selectedModel={selectedOpenAIModel}
            setSelectedModel={setSelectedOpenAIModel}
            apiKeySaved={openAIApiKeySaved}
            saveApiKey={saveOpenAIApiKey}
            deleteApiKey={deleteOpenAIApiKey}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          />
        </Tabs.Panel>
      </Tabs>
    </Card>
  )
}
