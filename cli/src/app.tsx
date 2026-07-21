import { AppStore } from "store";
import { direct } from "api";
import { log } from "include/src/logger";
import type { FlowContext } from "store/src/types";
import { PromptInput } from "./components/PromptInput";
import { HistoryPane } from "./components/HistoryPane";
import { Airline } from "./components/Airline";

interface AppProps {
  prompt?: string;
}

// runs the direct flow against the prior conversation (ctx.history) plus the
// newly submitted input, streaming text into uiState.history (one entry per
// turn, appended to in place as deltas arrive) and recording the assembled
// reply in chatState.history so the next turn has it as context.
async function runDirect(ctx: FlowContext, input: string) {
  let assistantText = "";
  let started = false;

  try {
    for await (const event of direct(ctx).run(input)) {
      if (event.type !== "text" && event.type !== "thinking") continue;

      const uiState = AppStore.getState().uiState;
      if (started) {
        uiState.appendToLastEntry(event.text);
      } else {
        started = true;
        uiState.appendHistory(event.text);
      }
      if (event.type === "text") assistantText += event.text;
    }
  } catch (err) {
    // XXX surface this once error rendering (TODO) lands
    log.error(err, "direct flow failed");
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

    void runDirect(ctx, value);
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
