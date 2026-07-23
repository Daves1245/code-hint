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
// (ctx.history) plus the newly submitted input. Streams text/thinking into
// uiState.history (one entry per turn, appended to in place as deltas
// arrive), surfaces tool calls as their own entries, and records the
// assembled reply in chatState.history so the next turn has it as context.
async function run(ctx: FlowContext, input: string) {
  const chatMode = AppStore.getState().chatState.mode;
  const flow = flowFor(chatMode);
  let assistantText = "";
  let started = false;

  try {
    for await (const event of flow(ctx).run(input)) {
      const uiState = AppStore.getState().uiState;

      switch (event.type) {
        case "text":
        case "thinking":
          if (started) {
            uiState.appendToLastEntry(event.text);
          } else {
            started = true;
            uiState.appendHistory(event.text);
          }
          if (event.type === "text") assistantText += event.text;
          break;
        case "tool-call":
          uiState.appendHistory(`Called tool: ${event.name}`);
          started = false;
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

    const ctx: FlowContext = { history: chatState.history };
    chatState.appendHistory({ role: "user", content: value });

    void run(ctx, value);
  };

  // outer box: border (1+1) + padding (2+2)
  const OUTER_CHROME = 6;
  const maxHistoryHeight = Math.max(
    uiState.screenDimensions.height - OUTER_CHROME - uiState.inputHeight,
    0,
  );
  const historyHeight = Math.min(
    uiState.historyContentHeight,
    maxHistoryHeight,
  );

  return (
    <box
      height={uiState.screenDimensions.height}
      width={uiState.screenDimensions.width}
      padding={2}
      border
    >
      <HistoryPane
        history={uiState.history}
        height={historyHeight}
        onContentSizeChange={uiState.setHistoryContentHeight}
      />
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
