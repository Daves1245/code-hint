export interface AppState {
  authState: AuthState;
  chatState: ChatState;
  uiState: UIState;
  setUIState: (state: UIState) => void;
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
  screenDimensions: [number, number];
}
