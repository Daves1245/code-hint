import { AppStore } from "store";
import { useEffect } from "react";
import { PromptInput } from "./components/PromptInput";

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
  const SCROLLBOX_PADDING = 2;
  const maxHistoryHeight = Math.max(
    uiState.screenDimensions.height - OUTER_CHROME - uiState.inputHeight,
    0,
  );
  const historyHeight = Math.min(
    uiState.history.length + SCROLLBOX_PADDING,
    maxHistoryHeight,
  );

  return (
    <box
      height={uiState.screenDimensions.height}
      width={uiState.screenDimensions.width}
      padding={2}
      border
    >
      <scrollbox
        height={historyHeight}
        flexShrink={1}
        width="100%"
        scrollY
        stickyScroll
        stickyStart="bottom"
        contentOptions={{ flexDirection: "column", padding: 1 }}
      >
        {uiState.history.map((entry, i) => (
          <text key={i}>{entry}</text>
        ))}
      </scrollbox>
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
