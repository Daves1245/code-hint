import { create } from "zustand";
import type { AppState } from "./types";

export const AppStore = create<AppState>()((set) => ({
  prompt: "",
  setPrompt: (prompt: string) => set({ prompt }),
}));
