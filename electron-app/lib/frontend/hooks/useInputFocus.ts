import { IPCChannel } from '@/lib/main/ipc/channels'
import { useEffect, useRef } from 'react'

export function useInputFocus<T extends HTMLElement>(eventName: IPCChannel) {
  const apiKeyInputRef = useRef<T>(null)

  useEffect(() => {
    const unsub = window.api.receive(eventName as any, () => {
      apiKeyInputRef.current?.focus()
    })

    return () => unsub()
  }, [eventName])

  return apiKeyInputRef
}
