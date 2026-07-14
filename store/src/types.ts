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
  input: string;
  history: string[];
  setInput: (input: string) => void;
  setHistory: (history: string[]) => void;
  appendHistory: (entry: string) => void;
  state: { type: "error"; errmsg: string } | { type: "ok"; data: {} };
  screenDimensions: {
    height: number;
    width: number;
  };
  focusedId: string | null;
  setFocusedId: (focusedId: string | null) => void;
}
