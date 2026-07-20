export type Loadable<T> =
  | { status: "idle" }
  | { status: "loading"; taskId: string; prevData?: T }
  | { status: "error"; prevData?: T; message: string }
  | { status: "success"; data: T };

export function getTaskId<T>(loadable?: Loadable<T> | null): string | null {
  if (!loadable) return null;
  switch (loadable.status) {
    case "loading":
      return loadable.taskId;
    default:
      return null;
  }
}

export interface AppState {
  authState: Loadable<null>;
  chatState: ChatState;
  uiState: UIState;
  setAuthState: (state: Loadable<null>) => void;
  setChatState: (state: ChatState) => void;
}

export interface ChatState {
  prompt: string;
  history: string[];
  mode: ChatMode;
  setPrompt: (prompt: string) => void;
  setHistory: (history: string[]) => void;
  appendHistory: (entry: string) => void;
  setMode: (mode: ChatMode) => void;
}

export interface Settings {}

export interface UIState {
  history: string[];
  setHistory: (history: string[]) => void;
  appendHistory: (entry: string) => void;
  status: { type: "error"; errmsg: string } | { type: "ok" };
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

export type ChatMode = "direct" | "thinking" | "planning" | "executing";

export type MessageRole = "user" | "assistant" | "system";

// thin, provider-agnostic mirror of what an SDK message param looks like
// (e.g. Anthropic.MessageParam); providers/* translate to/from their own wire format
export type MessageContentBlock =
  | { type: "text"; text: string }
  | { type: "tool-call"; id: string; name: string; input: unknown }
  | {
      type: "tool-result";
      toolCallId: string;
      content: string;
      isError?: boolean;
    };

export interface Message {
  role: MessageRole;
  content: string | MessageContentBlock[];
}

export interface Flow {
  name: string;
  run(input: string, ctx: FlowContext): AsyncIterable<FlowEvent>;
}

// TODO for now, this is just the session history - but maybe we'd like to include
// memory-layer-specific additions here for future use.
export interface FlowContext {
  history: Message[];
}

export type FlowEvent =
  | { type: "text"; text: string }
  | { type: "thinking"; text: string }
  | { type: "tool-call"; text: string }
  | { type: "tool-result"; result: object; isError?: boolean }
  | { type: "done" };
