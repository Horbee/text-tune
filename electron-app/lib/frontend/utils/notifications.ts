import { showNotification } from '@mantine/notifications'

export const showErrorNotification = (title: string, message: string) => {
  showNotification({
    withBorder: true,
    title,
    message,
    color: 'red',
    autoClose: false,
  })
}
