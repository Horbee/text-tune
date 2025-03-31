export interface IElectronAPI {
  saveDeepLApiKey: (apiKey: string) => Promise<void>;
  checkApiKey: () => Promise<boolean>;
  deleteApiKey: () => Promise<void>;
  getBackendState: () => Promise<BackendState>;
  setBackendState: (backendState: Partial<BackendState>) => Promise<void>;
  onMessageFromMain: (callback: (message: any) => void) => void;
  removeMessageListener: () => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export type BackendState = {
  workingMode: "deepl" | "ollama";
  ollamaModel: string | null;
  translateHistory: HistoryItem[];
};

export type HistoryItem = {
  id: number;
  type: "original" | "fix";
  text: string;
};

export type FixTextFn = (
  text: string,
  targetLang?: TargetLanguageCode
) => Promise<string>;
