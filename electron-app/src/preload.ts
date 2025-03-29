// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  saveDeepLApiKey: (apiKey: string) =>
    ipcRenderer.invoke("save-api-key", apiKey),
  deleteApiKey: () => ipcRenderer.invoke("delete-api-key"),
  checkApiKey: () => ipcRenderer.invoke("check-api-key"),
  // Expose a function to listen for messages
  onMessageFromMain: (callback: (message: any) => void) => {
    ipcRenderer.on("message-from-main", (_event, message) => callback(message));
  },
  // Optional: function to remove the listener
  removeMessageListener: () => {
    ipcRenderer.removeAllListeners("message-from-main");
  },
});
