import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { App } from "./app";
import { createRoot } from "@opentui/react";
import { AppStore } from "store";
import { runAuthTransition } from "./authTransition";

// opentui opens its console on startup when SHOW_CONSOLE is set; docking it to
// the right and giving the app only the remaining width makes the two share the
// screen instead of the console overlaying the app.
const showConsole = ["1", "true"].includes(process.env.SHOW_CONSOLE ?? "");
const consolePercent = 40;

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.RIGHT,
    sizePercent: consolePercent,
  },
});

// mirrors the console's own width math so the panes meet without a gap
const appWidth = (width: number) =>
  showConsole ? width - Math.max(1, Math.floor((width * consolePercent) / 100)) : width;

AppStore.getState().uiState.setScreenDimensions({
  width: appWidth(renderer.width),
  height: renderer.height,
});
renderer.on("resize", (width: number, height: number) => {
  AppStore.getState().uiState.setScreenDimensions({ width: appWidth(width), height });
});

export default async function main() {
  await runAuthTransition();

  createRoot(renderer).render(<App />);
}

void main();
