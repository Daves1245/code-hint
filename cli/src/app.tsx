import { AppStore } from "store";

export const App = () => {
  const prompt = AppStore((state) => state.prompt);
  return <text>{prompt || "Hello, world!"}</text>;
};
