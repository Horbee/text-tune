import { Stack, Title, Paper, Text, Flex, Box } from "@mantine/core";
import { useState, useEffect } from "react";

export function FixHistory() {
  const [history, setHistory] = useState<
    { id: number; type: "original" | "fix"; text: string }[]
  >([]);

  useEffect(() => {
    window.electron.onMessageFromMain(({ type, originalText, fixedText }) => {
      if (type === "FIX_SUCCESS") {
        setHistory([
          ...history,
          { id: history.length + 1, type: "original", text: originalText },
          { id: history.length + 2, type: "fix", text: fixedText },
        ]);
      }
    });
  }, []);

  const reversedHistory = [...history].reverse();

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
          <Box
            key={item.id}
            style={{
              alignSelf: item.type === "fix" ? "flex-end" : "flex-start",
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
        ))}
      </Flex>
    </Stack>
  );
}
