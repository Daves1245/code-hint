import { create } from "zustand";
import { getScreenDimensions } from "include";
import type { AppState, AuthState, ChatState } from "./types";

export const AppStore = create<AppState>()((set) => ({
  authState: { type: "idle" },
  chatState: {
    prompt: "",
    setPrompt: (prompt: string) =>
      set((state: AppState) => ({
        chatState: { ...state.chatState, prompt },
      })),
    history: [],
    setHistory: (history: string[]) =>
      set((state: AppState) => ({
        chatState: { ...state.chatState, history },
      })),
  },
  uiState: {
    input: "",
    setInput: (input: string) =>
      set((state: AppState) => ({
        uiState: { ...state.uiState, input },
      })),
    history: "",
    setHistory: (history: string) =>
      set((state: AppState) => ({
        uiState: { ...state.uiState, history },
      })),
    state: { type: "ok", data: {} },
    screenDimensions: getScreenDimensions(),
    focusedId: "input",
    setFocusedId: (focusedId: string | null) =>
      set((state: AppState) => ({
        uiState: { ...state.uiState, focusedId },
      })),
  },
  setAuthState: (authState: AuthState) => set({ authState }),
  setChatState: (chatState: ChatState) => set({ chatState }),
}));
