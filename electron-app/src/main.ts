import {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  clipboard,
  Tray,
  Menu,
  nativeImage,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import {
  saveSecureConfig,
  getSecureConfig,
  deleteSecureConfig,
} from "./secure-store";
import { keyTap } from "./robot-helper.cjs";
import { sleep } from "./utils";
import { fixTextFactory as fixTextFactoryDeepl } from "./deepl-fix";
import { fixTextFactory as fixTextFactoryOllama } from "./ollama-fix";
import { loadConfig, saveConfig } from "./config";

import type { HistoryItem, BackendState, FixTextFn } from "../electron-types";

let fixText: FixTextFn | null = null;
let backendState: BackendState = {
  workingMode: "deepl",
  ollamaModel: null,
  translateHistory: [] as HistoryItem[],
};

ipcMain.handle("save-api-key", async (event, deeplApiKey: string) => {
  try {
    saveSecureConfig({ deeplApiKey });
    fixText = fixTextFactoryDeepl(deeplApiKey);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("delete-api-key", async (event) => {
  try {
    deleteSecureConfig("deeplApiKey");
    fixText = null;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("check-api-key", async (event) => {
  const config = getSecureConfig();
  return !!config?.deeplApiKey;
});

ipcMain.handle("get-backend-state", async (event) => {
  return backendState;
});

ipcMain.handle(
  "set-backend-state",
  async (event, newState: Partial<BackendState>) => {
    fixText = null;

    backendState = { ...backendState, ...newState };

    saveConfig({
      workingMode: backendState.workingMode,
      ollamaModel: backendState.ollamaModel,
    });
  }
);

// Send to specific window
function sendToRenderer(window: BrowserWindow, message: any) {
  window.webContents.send("message-from-main", message);
}

// Or send to all windows
function broadcastToAll(message: any) {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("message-from-main", message);
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Load config, setup backend state
  const config = loadConfig();
  backendState.workingMode = config.workingMode;
  backendState.ollamaModel = config.ollamaModel;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(app.getAppPath(), "assets/icon.png"),
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let tray: Tray | null = null;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(
    path.join(app.getAppPath(), "assets/trayIconTemplate@4x.png")
  );
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      type: "normal",
      click: () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        } else {
          BrowserWindow.getAllWindows()[0].show();
        }
      },
    },
    { type: "separator" },
    { label: "Quit", type: "normal", click: () => app.quit() },
  ]);

  // tray.setToolTip("This is my application.");
  // tray.setTitle("AI Text Fixer");
  tray.setContextMenu(contextMenu);

  globalShortcut.register("F9", fixCurrentLine);
  globalShortcut.register("F10", fixSelection);
});

const fixCurrentLine = async () => {
  console.log("fixCurrentLine");
  const isMac = process.platform === "darwin";
  const cmdKey = isMac ? "command" : "control";

  keyTap("left", [cmdKey, "shift"]);

  fixSelection();
};

const fixSelection = async () => {
  console.log("fixSelection");

  if (!fixText) {
    if (backendState.workingMode === "deepl") {
      const config = getSecureConfig();
      if (!config?.deeplApiKey) {
        broadcastToAll({
          type: "ERROR",
          title: "No API key found",
          message: "Please enter a valid DeepL API key first.",
        });
        console.log("No DeepL API key found");
        return;
      }
      fixText = fixTextFactoryDeepl(config.deeplApiKey);
    } else if (backendState.workingMode === "ollama") {
      if (!backendState.ollamaModel) {
        broadcastToAll({
          type: "ERROR",
          title: "No model selected",
          message: "Please select a model first.",
        });
        console.log("No model selected");
        return;
      }
      fixText = fixTextFactoryOllama(backendState.ollamaModel);
    }
  }

  const isMac = process.platform === "darwin";
  const cmdKey = isMac ? "command" : "control";

  keyTap("c", [cmdKey]);

  await sleep(100);

  const text = clipboard.readText();
  console.log("Original text:", text);

  const fixedText = await fixText(text);
  console.log("Fixed text:", fixedText);

  clipboard.writeText(fixedText);
  await sleep(100);

  keyTap("v", [cmdKey]);

  backendState.translateHistory.push({
    id: backendState.translateHistory.length + 1,
    type: "original",
    text,
  });

  backendState.translateHistory.push({
    id: backendState.translateHistory.length + 1,
    type: "fix",
    text: fixedText,
  });

  broadcastToAll({
    type: "FIX_SUCCESS",
    historyState: backendState.translateHistory,
  });
};
