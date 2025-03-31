import { useEffect } from "react";

import { Grid, Stack, SegmentedControl, Transition, Box } from "@mantine/core";
import { DeeplConfigManager } from "./DeeplConfigManager";
import { Instructions } from "./Instructions";
import { FixHistory } from "./FixHistory";
import { showNotification } from "@mantine/notifications";
import { OllamaConfigManager } from "./OllamaConfigManager";
import { useFrontendStore } from "./stores/frontend-store";

export const showErrorNotification = (title: string, message: string) => {
  showNotification({
    withBorder: true,
    title,
    message,
    color: "red",
    autoClose: false,
  });
};

function App() {
  const {
    initStore,
    deeplApiKeySaved,
    ollamaModelSelected,
    selectedOllamaModel,
    workingMode,
    setWorkingMode,
    setSelectedOllamaModel,
    saveDeeplApiKey,
    deleteDeeplApiKey,
    setupListeners,
    cleanupListeners,
  } = useFrontendStore();

  useEffect(() => {
    initStore();

    setupListeners();

    return () => {
      cleanupListeners();
    };
  }, []);

  return (
    <Grid p="lg">
      <Grid.Col span={5} p="lg">
        <Stack gap="xl">
          <SegmentedControl
            value={workingMode}
            onChange={(value) => setWorkingMode(value as "deepl" | "ollama")}
            data={[
              { label: "DeepL", value: "deepl" },
              { label: "Ollama", value: "ollama" },
            ]}
          />

          <Box style={{ position: "relative" }} h="250px">
            <Transition
              mounted={workingMode === "deepl"}
              transition="slide-right"
              // enterDelay={500}
            >
              {(styles) => (
                <DeeplConfigManager
                  apiKeySaved={deeplApiKeySaved}
                  saveApiKey={saveDeeplApiKey}
                  deleteApiKey={deleteDeeplApiKey}
                  style={{ ...styles, position: "absolute" }}
                />
              )}
            </Transition>

            <Transition
              mounted={workingMode === "ollama"}
              transition="slide-left"
              // enterDelay={500}
            >
              {(styles) => (
                <OllamaConfigManager
                  selectedModel={selectedOllamaModel}
                  setSelectedModel={setSelectedOllamaModel}
                  style={{ ...styles, position: "absolute" }}
                />
              )}
            </Transition>
          </Box>

          <Instructions
            readyToFix={
              workingMode === "deepl" ? deeplApiKeySaved : ollamaModelSelected
            }
          />
        </Stack>
      </Grid.Col>
      <Grid.Col span={7} p="lg">
        <FixHistory />
      </Grid.Col>
    </Grid>
  );
}

export default App;
