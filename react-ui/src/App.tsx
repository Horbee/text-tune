import { useState } from "react";

import { Grid, Stack } from "@mantine/core";
import { ConfigManager } from "./ConfigManager";
import { Instructions } from "./Instructions";
import { FixHistory } from "./FixHistory";

function App() {
  const [apiKeySaved, setApiKeySaved] = useState(false);

  return (
    <Grid>
      <Grid.Col span={5} p="lg">
        <Stack gap="xl">
          <ConfigManager
            apiKeySaved={apiKeySaved}
            saveApiKey={() => setApiKeySaved(true)}
            deleteApiKey={() => setApiKeySaved(false)}
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
