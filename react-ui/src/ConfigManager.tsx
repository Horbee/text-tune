import {
  Button,
  PasswordInput,
  Stack,
  Text,
  Title,
  Alert,
} from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { FaRegHeart } from "react-icons/fa";

export const ConfigManager = ({
  apiKeySaved,
  saveApiKey,
  deleteApiKey,
}: {
  apiKeySaved: boolean;
  saveApiKey: (apiKey: string) => void;
  deleteApiKey: () => void;
}) => {
  const form = useForm({
    mode: "controlled",
    initialValues: { apiKey: "" },
    validate: {
      apiKey: hasLength({ min: 1 }, "Must be at least 1 character"),
    },
  });

  const submit = (values: typeof form.values) => {
    console.log(values);
    saveApiKey(values.apiKey);
    form.reset();
  };

  return (
    <Stack gap="sm">
      <Title order={2}>Save your DeepL API Key</Title>

      {!apiKeySaved ? (
        <form
          onSubmit={form.onSubmit(submit)}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <PasswordInput
            label="API Key"
            placeholder="Enter your API key"
            {...form.getInputProps("apiKey")}
          />

          <Button type="submit">Save</Button>
        </form>
      ) : (
        <Alert
          variant="light"
          color="green"
          title="Your API Key is saved"
          icon={<FaRegHeart />}
        >
          <Text>
            You can now use the extension, or delete the key and enter a new
            one.
          </Text>
          <Button
            mt={5}
            variant="outline"
            size="compact-sm"
            color="red"
            onClick={deleteApiKey}
          >
            Reset
          </Button>
        </Alert>
      )}
    </Stack>
  );
};
