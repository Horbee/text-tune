import { Stack, Title, StackProps, Group, TextInput, ActionIcon } from '@mantine/core'
import { FaCheck } from 'react-icons/fa'
import { useInputFocus } from '@/lib/frontend/hooks/useInputFocus'
import { hasLength, useForm } from '@mantine/form'
import { ServerConnectionStatus } from './ServerConnectionStatus'

type Props = {
  textTuneServerUrl: string | null
  saveTextTuneServerUrl: (textTuneServerUrl: string) => Promise<void>
  deleteTextTuneServerUrl: () => Promise<void>
} & StackProps

export const TextTuneAIConfigManager = ({
  textTuneServerUrl,
  saveTextTuneServerUrl,
  deleteTextTuneServerUrl,
  ...props
}: Props) => {
  const textTuneServerUrlInputRef = useInputFocus<HTMLInputElement>('focus-text-tune-url-input')

  const textTuneServerUrlSaved = !!textTuneServerUrl

  const form = useForm({
    mode: 'controlled',
    initialValues: { textTuneServerUrl: '' },
    validate: {
      textTuneServerUrl: hasLength({ min: 1 }, 'Must be at least 1 character'),
    },
  })

  const submit = (values: typeof form.values) => {
    saveTextTuneServerUrl(values.textTuneServerUrl)
    form.reset()
  }

  return (
    <Stack gap="sm" {...props}>
      <Title order={3}>Text Tune AI Configuration</Title>

      {!textTuneServerUrlSaved ? (
        <form onSubmit={form.onSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Group align="end" gap="xs">
            <TextInput
              ref={textTuneServerUrlInputRef}
              label="Text Tune Server URL"
              placeholder="Enter your Text Tune server URL"
              flex="1"
              {...form.getInputProps('textTuneServerUrl')}
            />

            <ActionIcon type="submit" size="36">
              <FaCheck />
            </ActionIcon>
          </Group>
        </form>
      ) : (
        <ServerConnectionStatus
          textTuneServerUrl={textTuneServerUrl}
          deleteTextTuneServerUrl={deleteTextTuneServerUrl}
        />
      )}
    </Stack>
  )
}
