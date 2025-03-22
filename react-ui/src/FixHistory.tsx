import { Stack, Title, Paper, Text, Flex, Box } from "@mantine/core";
import { useState } from "react";

export function FixHistory() {
  const [history, setHistory] = useState<
    { id: number; type: string; text: string }[]
  >([
    { id: 1, type: "original", text: "1. Fix the syntax error in the code" },
    { id: 2, type: "fix", text: "2. Fix the syntax error in the code" },
    // { id: 3, type: "original", text: "3. Fix the syntax error in the code" },
    // { id: 4, type: "fix", text: "4. Fix the syntax error in the code" },
    // { id: 5, type: "original", text: "5. Fix the syntax error in the code" },
    // { id: 6, type: "fix", text: "6. Fix the syntax error in the code" },
    // { id: 7, type: "original", text: "7. Fix the syntax error in the code" },
    // { id: 8, type: "fix", text: "8. Fix the syntax error in the code" },
    // { id: 9, type: "original", text: "9. Fix the syntax error in the code" },
    // { id: 10, type: "fix", text: "10. Fix the syntax error in the code" },
  ]);

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
