import { create } from "zustand";
import { showErrorNotification } from "../App";

import type { HistoryItem } from "../../../electron-types";

type Store = {
  deeplApiKeySaved: boolean;
  ollamaModelSelected: boolean;
  workingMode: "deepl" | "ollama";
  setWorkingMode: (mode: "deepl" | "ollama") => Promise<void>;
  selectedOllamaModel: string | null;
  setSelectedOllamaModel: (model: string | null) => Promise<void>;
  fixHistory: HistoryItem[];
  initStore: () => Promise<void>;
  saveDeeplApiKey: (apiKey: string) => Promise<void>;
  deleteDeeplApiKey: () => Promise<void>;
  setupListeners: () => void;
  cleanupListeners: () => void;
};

export const useFrontendStore = create<Store>()((set) => ({
  deeplApiKeySaved: false,
  ollamaModelSelected: false,
  workingMode: "deepl",
  selectedOllamaModel: null,
  fixHistory: [],

  initStore: async () => {
    const deeplApiKeySaved = await window.electron.checkApiKey();
    const backendState = await window.electron.getBackendState();

    console.log(backendState);

    set({
      deeplApiKeySaved,
      workingMode: backendState.workingMode,
      ollamaModelSelected: !!backendState.ollamaModel,
      selectedOllamaModel: backendState.ollamaModel,
      fixHistory: backendState.translateHistory,
    });
  },

  setSelectedOllamaModel: async (model) => {
    try {
      await window.electron.setBackendState({ ollamaModel: model });
      set({ selectedOllamaModel: model, ollamaModelSelected: !!model });
    } catch (error) {
      showErrorNotification("Ollama model was not set!", "Please try again.");
    }
  },
  setWorkingMode: async (mode) => {
    console.log(mode);
    try {
      await window.electron.setBackendState({ workingMode: mode });
      set({ workingMode: mode });
    } catch (error) {
      showErrorNotification("Working mode was not set!", "Please try again.");
    }
  },
  saveDeeplApiKey: async (apiKey: string) => {
    try {
      await window.electron.saveDeepLApiKey(apiKey);
      set({ deeplApiKeySaved: true });
    } catch (error) {
      showErrorNotification("Api Key was not saved!", "Please try again.");
      set({ deeplApiKeySaved: false });
    }
  },
  deleteDeeplApiKey: async () => {
    try {
      await window.electron.deleteApiKey();
      set({ deeplApiKeySaved: false });
    } catch (error) {
      showErrorNotification("Api Key was not deleted!", "Please try again.");
    }
  },
  setupListeners: () => {
    window.electron.onMessageFromMain(
      ({ type, title, message, historyState }) => {
        if (type === "ERROR") {
          showErrorNotification(title, message);
        }
        if (type === "FIX_SUCCESS") {
          set({ fixHistory: historyState });
        }
      }
    );
  },
  cleanupListeners: () => {
    window.electron.removeMessageListener();
  },
}));
