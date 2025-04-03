import { Paper, Box, Transition, Text } from "@mantine/core";
import { useState, useEffect } from "react";

import type { HistoryItem } from "../../electron-types";

export const FixHistoryItem = ({
  item,
  enterDelay,
}: {
  item: HistoryItem;
  enterDelay?: number;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Transition mounted={mounted} transition="slide-up" enterDelay={enterDelay}>
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
  );
};
