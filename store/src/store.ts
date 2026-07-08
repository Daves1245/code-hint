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
  },
  setAuthState: (authState: AuthState) => set({ authState }),
  setChatState: (chatState: ChatState) => set({ chatState }),
}));
