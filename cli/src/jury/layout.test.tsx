import { beforeEach, describe, it, expect } from "vitest";
import { testRender } from "@opentui/react/test-utils";
import { App } from "../app";
import { AppStore } from "store";

const LONG_LINE =
  "this is a fairly long line of text that should wrap across multiple visual rows";

function resetStore() {
  AppStore.getState().chatState.setPrompt("");
  AppStore.getState().chatState.setHistory([]);
  AppStore.getState().uiState.setHistory([]);
  AppStore.getState().uiState.setFocusedId("input");
  AppStore.getState().uiState.setInputHeight(5);
  AppStore.getState().uiState.setHistoryContentHeight(2);
}

// onSizeChange-driven state updates (typing, submitting, resizing) settle
// over a couple of render passes rather than in the triggering frame itself;
// waitForVisualIdle() is unusable here because the focused textarea's
// blinking cursor keeps producing new frames and it never reports idle
async function settle(renderOnce: () => Promise<void>) {
  for (let i = 0; i < 3; i++) await renderOnce();
}

describe("input/history auto-sizing", () => {
  beforeEach(() => {
    resetStore();
  });

  it("grows the input box as wrapped text is typed, and shrinks it back on submit", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    const { renderer, mockInput, renderOnce, captureCharFrame } =
      await testRender(<App />, { width: 60, height: 20 });
    await settle(renderOnce);

    const singleLineHeight = AppStore.getState().uiState.inputHeight;

    await mockInput.typeText(LONG_LINE);
    await settle(renderOnce);

    const wrappedFrame = captureCharFrame();
    // the line is long enough that it must wrap; check both ends survive
    // without pinning the exact column where the wrap happens
    expect(wrappedFrame).toContain("this is a fairly");
    expect(wrappedFrame).toContain("visual rows");
    expect(wrappedFrame).not.toContain(LONG_LINE);
    expect(AppStore.getState().uiState.inputHeight).toBeGreaterThan(
      singleLineHeight,
    );

    mockInput.pressEnter();
    await settle(renderOnce);

    // submitting clears the textarea and the box collapses back down
    expect(AppStore.getState().uiState.inputHeight).toBe(singleLineHeight);
    expect(AppStore.getState().uiState.history).toEqual([LONG_LINE]);

    renderer.destroy();
  });

  it("wraps long history entries instead of truncating them, and grows the history box to fit", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    const { renderer, mockInput, renderOnce, captureCharFrame } =
      await testRender(<App />, { width: 60, height: 20 });
    await settle(renderOnce);

    const emptyContentHeight = AppStore.getState().uiState.historyContentHeight;

    await mockInput.typeText(LONG_LINE);
    mockInput.pressEnter();
    await settle(renderOnce);

    const frame = captureCharFrame();
    // both ends of the entry must be visible, not clipped or truncated
    expect(frame).toContain("this is a fairly");
    expect(frame).toContain("visual rows");
    expect(AppStore.getState().uiState.historyContentHeight).toBeGreaterThan(
      emptyContentHeight + 1,
    );

    renderer.destroy();
  });

  it("re-wraps and re-sizes both panes when the terminal is resized", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 100, height: 20 });
    const { renderer, mockInput, renderOnce, captureCharFrame, resize } =
      await testRender(<App />, { width: 100, height: 20 });
    await settle(renderOnce);

    await mockInput.typeText(LONG_LINE);
    mockInput.pressEnter();
    await settle(renderOnce);

    // wide enough to fit on a single visual row
    expect(captureCharFrame()).toContain(LONG_LINE);
    const wideHeight = AppStore.getState().uiState.historyContentHeight;

    resize(60, 20);
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    await settle(renderOnce);

    // too narrow now, so it must wrap into more lines than before
    expect(captureCharFrame()).not.toContain(LONG_LINE);
    expect(AppStore.getState().uiState.historyContentHeight).toBeGreaterThan(
      wideHeight,
    );

    renderer.destroy();
  });
});
