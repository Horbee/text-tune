import type { WorkingMode } from '@/lib/main/types'

export interface Provider {
  readonly id: WorkingMode
  ensureReady(): Promise<void> // throws with descriptive error if not ready
  fix(text: string): Promise<string>
}

export interface ProviderInitContext {
  // Potential shared dependencies (config, notification service) in future
}
