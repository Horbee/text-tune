export interface IElectronAPI {
  saveDeepLApiKey: (apiKey: string) => Promise<void>;
  checkApiKey: () => Promise<boolean>;
  deleteApiKey: () => Promise<void>;
  onMessageFromMain: (callback: (message: any) => void) => void;
  removeMessageListener: () => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
