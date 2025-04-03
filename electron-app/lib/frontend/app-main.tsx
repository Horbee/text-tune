import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import App from './App'

export default function AppMain() {
  return (
    <MantineProvider>
      <Notifications position="bottom-center" />
      <App />
    </MantineProvider>
  )
}
