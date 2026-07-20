import { create } from "zustand";
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
    appendHistory: (entry: string) =>
      set((state: AppState) => ({
        chatState: {
          ...state.chatState,
          history: [...state.chatState.history, entry],
        },
      })),
  },
  uiState: {
    history: [],
    setHistory: (history: string[]) =>
      set((state: AppState) => ({
        uiState: { ...state.uiState, history },
      })),
    appendHistory: (entry: string) =>
      set((state: AppState) => ({
        uiState: {
          ...state.uiState,
          history: [...state.uiState.history, entry],
        },
      })),
    state: { type: "ok", data: {} },
    // placeholder until screen initialization, after renderer is initialized
    screenDimensions: { width: -1, height: -1 },
    setScreenDimensions: (screenDimensions: {
      height: number;
      width: number;
    }) =>
      set((state: AppState) => ({
        uiState: { ...state.uiState, screenDimensions },
      })),
    // border(2) + padding(2) + 1 empty line, matches PromptInput's initial layout
    inputHeight: 5,
    setInputHeight: (inputHeight: number) =>
      set((state: AppState) => ({
        uiState: { ...state.uiState, inputHeight },
      })),
    focusedId: "input",
    setFocusedId: (focusedId: string | null) =>
      set((state: AppState) => ({
        uiState: { ...state.uiState, focusedId },
      })),
  },
  setAuthState: (authState: AuthState) => set({ authState }),
  setChatState: (chatState: ChatState) => set({ chatState }),
}));
