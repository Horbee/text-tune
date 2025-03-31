import {
  Stack,
  Title,
  Paper,
  Text,
  Flex,
  Box,
  Transition,
} from "@mantine/core";
import { useFrontendStore } from "./stores/frontend-store";

export function FixHistory() {
  const fixHistory = useFrontendStore((store) => store.fixHistory);
  const reversedHistory = [...fixHistory].reverse();

  return (
    <Stack gap="sm">
      <Title order={2}>History</Title>
      <Flex
        direction="column-reverse"
        gap="sm"
        mah={500}
        style={{ overflowY: "auto" }}
      >
        {reversedHistory.map((item) => (
          <Transition mounted={true} transition="slide-up" key={item.id}>
            {(styles) => (
              <Box
                style={{
                  alignSelf: item.type === "fix" ? "flex-end" : "flex-start",
                  ...styles,
                }}
              >
                <Text size="xs">{item.type}</Text>
                <Paper
                  shadow="sm"
                  withBorder
                  p="xs"
                  radius="lg"
                  bg={item.type === "original" ? "red.1" : "blue.1"}
                >
                  <Text>{item.text}</Text>
                </Paper>
              </Box>
            )}
          </Transition>
        ))}
      </Flex>
    </Stack>
  );
}
