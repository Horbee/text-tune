import { SiDeepl, SiOpenai, SiOllama } from 'react-icons/si'
import trayIcon from '@/app/assets/trayIcon.png'
import type { WorkingMode } from '@/lib/main/types'

export interface ServiceConfig {
  label: string
  value: WorkingMode
  icon: (size: number) => React.ReactNode
}

export const services: ServiceConfig[] = [
  {
    label: 'Text Tune AI',
    value: 'tt-ai',
    icon: (size) => <img src={trayIcon} alt="Text Tune AI" style={{ width: size, height: size }} />,
  },
  {
    label: 'DeepL',
    value: 'deepl',
    icon: (size) => <SiDeepl fontSize={size} />,
  },
  {
    label: 'Ollama',
    value: 'ollama',
    icon: (size) => <SiOllama fontSize={size} />,
  },
  {
    label: 'ChatGPT',
    value: 'chatgpt',
    icon: (size) => <SiOpenai fontSize={size} />,
  },
]

export const getServiceByValue = (value: WorkingMode): ServiceConfig | undefined => {
  return services.find((service) => service.value === value)
}

export const getServiceLabel = (value: WorkingMode): string => {
  return getServiceByValue(value)?.label ?? value
}
