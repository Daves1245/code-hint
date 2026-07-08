export interface AppState {
  authState: AuthState;
  chatState: ChatState;
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
    state: { type: "error"; errmsg: string } | { type: "ok"; data: {} };
    screenDimensions: [number, number];
}
