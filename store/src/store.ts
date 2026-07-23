import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AppState, ChatMode, ChatState, Loadable, Message } from "./types";

export const AppStore = create<AppState>()(
  immer((set) => ({
    authState: { status: "idle" },
    chatState: {
      prompt: "",
      setPrompt: (prompt: string) =>
        set((state: AppState) => ({
          chatState: { ...state.chatState, prompt },
        })),
      history: [],
      setHistory: (history: Message[]) =>
        set((state: AppState) => ({
          chatState: { ...state.chatState, history },
        })),
      appendHistory: (entry: Message) =>
        set((state: AppState) => ({
          chatState: {
            ...state.chatState,
            history: [...state.chatState.history, entry],
          },
        })),
      // matches router.ts's hard-coded default until mode selection is wired up
      mode: "executing",
      setMode: (mode: ChatMode) =>
        set((state: AppState) => ({
          chatState: { ...state.chatState, mode },
        })),
    },
    flowContext: {
      history: [],
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
      appendToLastEntry: (delta: string) =>
        set((state: AppState) => {
          const history = state.uiState.history;
          const last = history[history.length - 1] ?? "";
          return {
            uiState: {
              ...state.uiState,
              history: [...history.slice(0, -1), last + delta],
            },
          };
        }),
      status: { type: "ok" },
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
      // padding(2) of the scrollbox content wrapper, no entries yet
      historyContentHeight: 2,
      setHistoryContentHeight: (historyContentHeight: number) =>
        set((state: AppState) => ({
          uiState: { ...state.uiState, historyContentHeight },
        })),
      focusedId: "input",
      setFocusedId: (focusedId: string | null) =>
        set((state: AppState) => ({
          uiState: { ...state.uiState, focusedId },
        })),
    },
    setAuthState: (authState: Loadable<null>) =>
      set((state: AppState) => ({
        authState,
        uiState: {
          ...state.uiState,
          status:
            authState.status === "error"
              ? { type: "error", errmsg: authState.message }
              : { type: "ok" },
        },
      })),
    setChatState: (chatState: ChatState) => set({ chatState }),
    setChatMode: (mode: ChatMode) =>
      set((state: AppState) => {
        state.chatState.mode = mode;
      }),
  })),
);
