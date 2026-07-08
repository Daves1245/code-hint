import { AppStore } from "store";

interface AppProps {
    prompt: string;
};

export const App = ({ prompt }: AppProps) => {
    AppStore.getState().chatState.setPrompt(prompt);
    return <text>{prompt || "Hello, world!"}</text>;
};
