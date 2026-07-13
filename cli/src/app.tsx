import { AppStore } from "store";

interface AppProps {
  prompt?: string;
}

export const App = ({ prompt }: AppProps) => {
  const chatState = AppStore.getState().chatState;
  const authState = AppStore.getState().authState;
  const uiState = AppStore.getState().uiState;

  chatState.setPrompt(prompt || "Hello, world!");

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
          onInput={uiState.setInput}
          onSubmit={() => chatState.setPrompt(uiState.input)}
        />
      </box>
    </box>
  );
};
