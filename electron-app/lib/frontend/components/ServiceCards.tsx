import { motion } from 'motion/react'
import { Card, Group, Tabs, Text } from '@mantine/core'
import { SiDeepl, SiOpenai, SiOllama } from 'react-icons/si'

import { useBackendStore } from '@/lib/frontend/stores/backend-store'
import { ChatGPTConfigManager } from '@/lib/frontend/components/ChatGPTConfigManager'
import { OllamaConfigManager } from '@/lib/frontend/components/OllamaConfigManager'
import { DeeplConfigManager } from '@/lib/frontend/components/DeeplConfigManager'

import type { WorkingMode } from '@/lib/main/types'

const MotionDeeplConfigManager = motion.create(DeeplConfigManager)
const MotionOllamaConfigManager = motion.create(OllamaConfigManager)
const MotionChatGPTConfigManager = motion.create(ChatGPTConfigManager)

const services = [
  { label: 'DeepL', value: 'deepl', icon: <SiDeepl fontSize={24} /> },
  { label: 'Ollama', value: 'ollama', icon: <SiOllama fontSize={24} /> },
  { label: 'ChatGPT', value: 'chatgpt', icon: <SiOpenai fontSize={24} /> },
]

export const ServiceCards = () => {
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
                {service.icon}
                <Text>{service.label}</Text>
              </Group>
            </Tabs.Tab>
          ))}
        </Tabs.List>

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
