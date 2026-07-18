import { createCliRenderer } from "@opentui/core";
import { App } from "./app";
import { createRoot } from "@opentui/react";
import { AppStore } from "store";

const renderer = await createCliRenderer();

AppStore.getState().uiState.setScreenDimensions({
  width: renderer.width,
  height: renderer.height,
});
renderer.on("resize", (width: number, height: number) => {
  AppStore.getState().uiState.setScreenDimensions({ width, height });
});

export default async function main() {
  createRoot(renderer).render(<App />);
}

void main();
