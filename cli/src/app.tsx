import { AppStore } from "store";

interface AppProps {
  prompt?: string;
}

const Screen = () => {
  const chatState = AppStore.getState().chatState;
  const uiState = AppStore.getState().uiState;

  return (
    <box
      height={uiState.screenDimensions.height}
      width={uiState.screenDimensions.width}
      flexDirection="column"
      padding={2}
      border
    >
      <box border width="100%" padding={1}>
        <input
          width="100%"
          value={uiState.input}
          focused={uiState.focusedId === "input"}
          onInput={uiState.setInput}
          onSubmit={() => chatState.setPrompt(uiState.input)}
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
