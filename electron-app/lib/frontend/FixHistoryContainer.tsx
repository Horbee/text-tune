import { Stack, Title, Flex } from "@mantine/core";
import { useFrontendStore } from "./stores/frontend-store";
import { FixHistoryItem } from "./FixHistoryItem";

export function FixHistoryContainer() {
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
          <FixHistoryItem
            key={item.id}
            item={item}
            enterDelay={item.type === "fix" ? 100 : undefined}
          />
        ))}
      </Flex>
    </Stack>
  );
}
