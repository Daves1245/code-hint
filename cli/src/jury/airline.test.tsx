import { beforeEach, describe, it, expect } from "vitest";
import { testRender } from "@opentui/react/test-utils";
import { parseColor } from "@opentui/core";
import { App } from "../app";
import { AppStore } from "store";
import { resetStore, settle, interact } from "./testHelpers";
import { CHAT_MODE_COLORS } from "../components/Airline";

describe("Airline", () => {
  beforeEach(() => {
    resetStore();
  });

  it("left-aligns the chat mode and colors it per mode when there is no error", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<App />, { width: 60, height: 20 });
    await settle(renderOnce);

    const line = captureCharFrame()
      .split("\n")
      .find((row) => row.includes("executing"));
    expect(line).toBeDefined();
    // right after the outer border + padding, not pushed to the right edge
    expect(line!.indexOf("executing")).toBeLessThan(6);

    const modeSpan = captureSpans()
      .lines.flatMap((row) => row.spans)
      .find((span) => span.text === "executing");
    expect(modeSpan?.fg.toInts()).toEqual(
      parseColor(CHAT_MODE_COLORS.executing).toInts(),
    );

    await interact(() => renderer.destroy());
  });

  it("shows 'Error: <message>' to the left of the chat mode when auth fails", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    AppStore.getState().setAuthState({
      status: "error",
      message: "unsupported llm provider: 'foo'",
    });
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <App />,
      { width: 60, height: 20 },
    );
    await settle(renderOnce);

    const frame = captureCharFrame();
    expect(frame).toContain("Error: unsupported llm provider: 'foo'");
    expect(frame).not.toContain("<error>:");

    const line = frame.split("\n").find((row) => row.includes("Error:"))!;
    expect(line.indexOf("Error:")).toBeLessThan(line.indexOf("executing"));

    await interact(() => renderer.destroy());
  });

  it("switches the chat mode color when the mode changes", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    AppStore.getState().chatState.setMode("thinking");
    const { renderer, renderOnce, captureSpans } = await testRender(<App />, {
      width: 60,
      height: 20,
    });
    await settle(renderOnce);

    const modeSpan = captureSpans()
      .lines.flatMap((row) => row.spans)
      .find((span) => span.text === "thinking");
    expect(modeSpan?.fg.toInts()).toEqual(
      parseColor(CHAT_MODE_COLORS.thinking).toInts(),
    );

    await interact(() => renderer.destroy());
  });
});
