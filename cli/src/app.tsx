import { AppStore } from "store";
import { log } from "include";
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

  return (
    <box
      height={uiState.screenDimensions.height}
      width={uiState.screenDimensions.width}
      flexDirection="column"
      padding={2}
      border
    >
      <scrollbox
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
      <box border width="100%" padding={1} flexShrink={0}>
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
