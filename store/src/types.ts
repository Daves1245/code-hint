export interface AppState {
  authState: AuthState;
  chatState: ChatState;
  uiState: UIState;
  setAuthState: (state: AuthState) => void;
  setChatState: (state: ChatState) => void;
}

export interface ChatState {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export type AuthState =
  | { type: "idle" }
  | { type: "invalid"; reason: string }
  | { type: "valid"; data: {} };

export interface Settings {}

export interface UIState {
  input: string;
  setInput: (input: string) => void;
  state: { type: "error"; errmsg: string } | { type: "ok"; data: {} };
  screenDimensions: {
    height: number;
    width: number;
  };
}
