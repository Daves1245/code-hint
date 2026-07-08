import { AppStore } from "store";

interface AppProps {
  prompt?: string;
}

export const App = ({ prompt }: AppProps) => {
  AppStore.getState().chatState.setPrompt(prompt || "Hello, world!");
  return <text>{AppStore.getState().chatState.prompt}</text>;
};
