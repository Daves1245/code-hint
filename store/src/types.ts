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
  flowContext: FlowContext;
  uiState: UIState;
  setAuthState: (state: Loadable<null>) => void;
  setChatState: (state: ChatState) => void;
}

export interface ChatState {
  prompt: string;
  // conversation history sent to the LLM, distinct from uiState.history
  // (the flat, human-readable log rendered in HistoryPane)
  history: Message[];
  mode: ChatMode;
  setPrompt: (prompt: string) => void;
  setHistory: (history: Message[]) => void;
  appendHistory: (entry: Message) => void;
  setMode: (mode: ChatMode) => void;
}

export interface Settings {}

// distinguishes how a history entry is rendered: "thinking" shows the model's
// reasoning muted+italic, everything else renders as normal text.
export type HistoryEntryKind = "text" | "thinking";

export interface HistoryEntry {
  kind: HistoryEntryKind;
  content: string;
}

export interface UIState {
  history: HistoryEntry[];
  setHistory: (history: HistoryEntry[]) => void;
  // starts a new entry; kind defaults to "text"
  appendHistory: (content: string, kind?: HistoryEntryKind) => void;
  // appends a delta onto the last entry in place, for rendering streamed text
  appendToLastEntry: (delta: string) => void;
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
  focusedId: string | null;
  setFocusedId: (focusedId: string | null) => void;
}

export type ChatMode = "direct" | "thinking" | "planning" | "executing";

export type MessageRole = "user" | "assistant" | "system";

// thin, provider-agnostic mirror of what an SDK message param looks like
// (e.g. Anthropic.MessageParam); providers/* translate to/from their own wire format
export type MessageContentBlock =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string; signature: string }
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

// ctx is captured by the factory function that builds a Flow (e.g. direct(ctx)),
// not passed to run() itself
export interface Flow {
  name: string;
  run(input: string): AsyncIterable<FlowEvent>;
}

// TODO for now, this is just the session history - but maybe we'd like to include
// memory-layer-specific additions here for future use.
export interface FlowContext {
  history: Message[];
}

// the one event shape used everywhere a stream is consumed: providers emit
// these directly, and flows forward/filter them rather than translating
// between a provider-level event type and a flow-level one.
export type FlowEvent =
  | { type: "text"; text: string }
  | { type: "thinking"; text: string }
  | { type: "tool-call"; id: string; name: string; input: unknown }
  | { type: "tool-result"; result: ToolResult }
  | { type: "done" };

// a provider's live response to a stream() call: incremental deltas as they
// arrive, plus the fully assembled assistant Message once the response
// completes. callers will append finalMessage() to history and its
// content for tool call blocks to decide whether to loop (use executor)
// this is nearly a direct copy of anthropic's stream() interface
export interface LLMStream {
  events: AsyncIterable<FlowEvent>;
  finalMessage(): Promise<Message>;
}

// a JSON Schema subset covering what tool input schemas actually need:
// primitive/object/array types, nested properties, and enum constraints.
export type JSONSchema =
  | {
      type: "string" | "number" | "integer" | "boolean" | "null";
      description?: string;
      enum?: (string | number | boolean | null)[];
    }
  | { type: "array"; description?: string; items: JSONSchema }
  | {
      type: "object";
      description?: string;
      properties: Record<string, JSONSchema>;
      required?: string[];
    };

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, JSONSchema>;
    required?: string[];
  };
}

// each tool has its own success/failure shape, discriminated by `tool`;
// union in more tools' results here as they get implemented.
export type ReadToolResult =
  | { tool: "read"; ok: true; contents: string }
  | { tool: "read"; ok: false; errMsg: string };

export type ToolResult = ReadToolResult;

export interface StreamOptions {
  thinking?: boolean;
  tools?: ToolDefinition[];
}
