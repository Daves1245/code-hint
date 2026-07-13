import { AppStore } from "store";

interface AppProps {
  prompt?: string;
}

export const App = ({ prompt }: AppProps) => {
  const chatState = AppStore.getState().chatState;
  const authState = AppStore.getState().authState;
  const uiState = AppStore.getState().uiState;

  chatState.setPrompt(prompt || "Hello, world!");
  return <text>{chatState.prompt}</text>;
};
