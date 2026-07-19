import { AppStore } from "store";
import { log } from "include/src/logger";
import { useEffect } from "react";

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

  // outer box: border (1+1) + padding (2+2); input box: border (1+1) + padding (1+1)
  const OUTER_CHROME = 6;
  const INPUT_CHROME = 4;
  const SCROLLBOX_PADDING = 2;
  const availableInputWidth = Math.max(
    uiState.screenDimensions.width - OUTER_CHROME - INPUT_CHROME,
    1,
  );
  const inputLines = Math.max(
    1,
    Math.ceil(uiState.input.length / availableInputWidth),
  );
  const inputBoxHeight = INPUT_CHROME + inputLines;
  const maxHistoryHeight = Math.max(
    uiState.screenDimensions.height - OUTER_CHROME - inputBoxHeight,
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
      <box
        border
        width="100%"
        padding={1}
        flexShrink={0}
        height={inputBoxHeight}
      >
        <input
          width="100%"
          value={uiState.input}
          focused={uiState.focusedId === "input"}
          onInput={uiState.setInput}
          onSubmit={(value) => {
            if (typeof value !== "string") {
              log.warn({ value }, "onSubmit received a non-string value");
              return;
            }
            uiState.appendHistory(value);
            value = "";
            uiState.setInput("");
          }}
        />
      </box>
    </box>
  );
};

export const App = ({ prompt }: AppProps) => {
  const chatState = AppStore.getState().chatState;
  const authState = AppStore.getState().authState;

  chatState.setPrompt(prompt || "Hello, world!");

  return <Screen />;
};
