import { AppStore } from "store";
import { useEffect } from "react";
import { PromptInput } from "./components/PromptInput";
import { HistoryPane } from "./components/HistoryPane";
import { Airline } from "./components/Airline";

interface AppProps {
  prompt?: string;
}

const Screen = () => {
  const chatState = AppStore((state) => state.chatState);
  const uiState = AppStore((state) => state.uiState);

  useEffect(() => {
    if (uiState.history.length === 0) return;
    const submitted = uiState.history[uiState.history.length - 1]!;
    chatState.setPrompt(submitted);
    chatState.appendHistory(submitted);
  }, [uiState.history]);

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
        onSubmit={(value) => uiState.appendHistory(value)}
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
