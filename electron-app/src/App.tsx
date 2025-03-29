import { useState, useEffect } from "react";

import { Grid, Stack } from "@mantine/core";
import { ConfigManager } from "./ConfigManager";
import { Instructions } from "./Instructions";
import { FixHistory } from "./FixHistory";
import { showNotification } from "@mantine/notifications";

function App() {
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const saveApiKey = async (apiKey: string) => {
    try {
      await window.electron.saveDeepLApiKey(apiKey);
      setApiKeySaved(true);
    } catch (error) {
      console.log("Api Key was not saved!");
      setApiKeySaved(false);
    }
  };

  const deleteApiKey = async () => {
    try {
      await window.electron.deleteApiKey();
      setApiKeySaved(false);
    } catch (error) {
      console.log("Api Key was not deleted!");
    }
  };

  useEffect(() => {
    window.electron.checkApiKey().then(setApiKeySaved);
  }, []);

  useEffect(() => {
    window.electron.onMessageFromMain(({ type, title, message }) => {
      if (type === "ERROR") {
        showNotification({
          withBorder: true,
          title,
          message,
          color: "red",
          autoClose: false,
        });
      }
    });

    return () => {
      window.electron.removeMessageListener();
    };
  }, []);

  return (
    <Grid p="lg">
      <Grid.Col span={5} p="lg">
        <Stack gap="xl">
          <ConfigManager
            apiKeySaved={apiKeySaved}
            saveApiKey={saveApiKey}
            deleteApiKey={deleteApiKey}
          />
          <Instructions apiKeySaved={apiKeySaved} />
        </Stack>
      </Grid.Col>
      <Grid.Col span={7} p="lg">
        <FixHistory />
      </Grid.Col>
    </Grid>
  );
}

export default App;
