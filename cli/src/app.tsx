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
      <box border width={uiState.screenDimensions.width}>
        <input width="100%" padding={1} />
      </box>
    </box>
  );
};
