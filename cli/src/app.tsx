import { AppStore } from "store";
import { direct, thinking, planning, executing } from "api";
import { log } from "include/src/logger";
import type { ChatMode, FlowContext } from "store/src/types";
import { PromptInput } from "./components/PromptInput";
import { HistoryPane } from "./components/HistoryPane";
import { Airline } from "./components/Airline";

interface AppProps {
  prompt?: string;
}

// dispatches on chatState.mode to pick a flow. the store initializes mode to
// "executing" and nothing in the app changes it yet, so only that branch
// actually runs today - but the mapping itself is real.
function flowFor(mode: ChatMode) {
  switch (mode) {
    case "direct":
      return direct;
    case "thinking":
      return thinking;
    case "planning":
      return planning;
    case "executing":
      return executing;
  }
}

// runs the flow selected for chatState.mode against the prior conversation
// (ctx.history) plus the newly submitted input. Streams into uiState.history as
// entries appended to in place as deltas arrive - text and thinking become
// separate entries (they render differently) and tool calls their own entry -
// and records the assembled reply in chatState.history so the next turn has it
// as context.
async function run(ctx: FlowContext, input: string) {
  AppStore.getState().chatState.setMode("thinking");
  const chatMode = AppStore.getState().chatState.mode;
  const flow = flowFor(chatMode);
  let assistantText = "";
  // the kind of the entry currently being streamed into, or null when the next
  // delta should open a fresh entry. Tracking it splits text and thinking into
  // separate entries (they render differently) and starts a new entry after a
  // tool call.
  let openKind: "text" | "thinking" | null = null;

  try {
    for await (const event of flow(ctx).run(input)) {
      const uiState = AppStore.getState().uiState;

      switch (event.type) {
        case "text":
        case "thinking":
          if (openKind === event.type) {
            uiState.appendToLastEntry(event.text);
          } else {
            openKind = event.type;
            uiState.appendHistory(event.text, event.type);
          }
          if (event.type === "text") assistantText += event.text;
          break;
        case "tool-call":
          uiState.appendHistory(`Called tool: ${event.name}`);
          openKind = null;
          break;
        case "tool-result":
        case "done":
          break;
      }
    }
  } catch (err) {
    // XXX surface this once error rendering (TODO) lands
    log.error(err, "executing flow failed");
    return;
  }

  if (assistantText) {
    AppStore.getState().chatState.appendHistory({
      role: "assistant",
      content: assistantText,
    });
  }
}

const Screen = () => {
  const chatState = AppStore((state) => state.chatState);
  const uiState = AppStore((state) => state.uiState);

  const handleSubmit = (value: string) => {
    uiState.appendHistory(value);
    chatState.setPrompt(value);
    chatState.setMode("thinking");

    const ctx: FlowContext = { history: chatState.history };
    chatState.appendHistory({ role: "user", content: value });

    void run(ctx, value);
  };

  return (
    <box
      height={uiState.screenDimensions.height}
      width={uiState.screenDimensions.width}
      padding={2}
      border
    >
      <HistoryPane history={uiState.history} />
      <Airline
        error={
          uiState.status.type === "error" ? uiState.status.errmsg : undefined
        }
        chatMode={chatState.mode}
      />
      <PromptInput
        focused={uiState.focusedId === "input"}
        onSubmit={handleSubmit}
        onSizeChange={uiState.setInputHeight}
      />
    </box>
  );
};

export const App = ({ prompt }: AppProps) => {
  const chatState = AppStore.getState().chatState;
  const authState = AppStore.getState().authState;

  chatState.setPrompt(prompt || "Hello, world!");

  return <Screen />;
};
