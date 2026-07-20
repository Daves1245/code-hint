export interface AppState {
  authState: AuthState;
  chatState: ChatState;
  uiState: UIState;
  setAuthState: (state: AuthState) => void;
  setChatState: (state: ChatState) => void;
}

export interface ChatState {
  prompt: string;
  history: string[];
  setPrompt: (prompt: string) => void;
  setHistory: (history: string[]) => void;
  appendHistory: (entry: string) => void;
}

export type AuthState =
  | { type: "idle" }
  | { type: "invalid"; reason: string }
  | { type: "valid"; data: {} };

export interface Settings {}

export interface UIState {
  history: string[];
  setHistory: (history: string[]) => void;
  appendHistory: (entry: string) => void;
  status: { type: "error"; errmsg: string } | { type: "ok"; };
  screenDimensions: {
    height: number;
    width: number;
  };
  setScreenDimensions: (screenDimensions: {
    height: number;
    width: number;
  }) => void;
  inputHeight: number;
  setInputHeight: (inputHeight: number) => void;
  historyContentHeight: number;
  setHistoryContentHeight: (historyContentHeight: number) => void;
  focusedId: string | null;
  setFocusedId: (focusedId: string | null) => void;
}
