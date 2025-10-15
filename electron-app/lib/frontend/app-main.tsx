import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import '@/lib/frontend/styles/app-styles.css'

import { createTheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import App from './App'

const theme = createTheme({})

export default function AppMain() {
  return (
    <MantineProvider forceColorScheme="dark" theme={theme}>
      <Notifications position="bottom-center" />
      <App />
    </MantineProvider>
  )
}
