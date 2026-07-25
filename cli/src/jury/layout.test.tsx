import { beforeEach, describe, it, expect } from "vitest";
import { testRender } from "@opentui/react/test-utils";
import { App } from "../app";
import { AppStore } from "store";
import { resetStore, settle, interact } from "./testHelpers";

const LONG_LINE =
  "this is a fairly long line of text that should wrap across multiple visual rows";

// row index (0-based, top to bottom) of the first frame line containing `text`,
// or -1 if it never appears. Used to prove entries flow downward and wrap onto
// distinct rows rather than overlapping on a single clipped line.
const rowOf = (frame: string, text: string) =>
  frame.split("\n").findIndex((line) => line.includes(text));

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

    await interact(() => mockInput.typeText(LONG_LINE));
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

    await interact(() => mockInput.pressEnter());
    await settle(renderOnce);

    // submitting clears the textarea and the box collapses back down
    expect(AppStore.getState().uiState.inputHeight).toBe(singleLineHeight);
    expect(AppStore.getState().uiState.history).toEqual([
      { kind: "text", content: LONG_LINE },
    ]);

    await interact(() => renderer.destroy());
  });

  it("wraps a long history entry downward across rows instead of overlapping or truncating it", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    const { renderer, mockInput, renderOnce, captureCharFrame } =
      await testRender(<App />, { width: 60, height: 20 });
    await settle(renderOnce);

    await interact(() => mockInput.typeText(LONG_LINE));
    await interact(() => mockInput.pressEnter());
    await settle(renderOnce);

    const frame = captureCharFrame();
    // both ends of the entry survive - it is neither clipped nor truncated
    expect(frame).toContain("this is a fairly");
    expect(frame).toContain("visual rows");
    // and the tail wraps onto a later row than the head, proving the entry
    // flows downward rather than piling onto one overlapped line
    expect(rowOf(frame, "visual rows")).toBeGreaterThan(
      rowOf(frame, "this is a fairly"),
    );

    await interact(() => renderer.destroy());
  });

  it("re-wraps a history entry when the terminal is resized narrower", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 100, height: 20 });
    const { renderer, mockInput, renderOnce, captureCharFrame, resize } =
      await testRender(<App />, { width: 100, height: 20 });
    await settle(renderOnce);

    await interact(() => mockInput.typeText(LONG_LINE));
    await interact(() => mockInput.pressEnter());
    await settle(renderOnce);

    // wide enough to fit on a single visual row
    const wideFrame = captureCharFrame();
    expect(wideFrame).toContain(LONG_LINE);
    expect(rowOf(wideFrame, "visual rows")).toBe(
      rowOf(wideFrame, "this is a fairly"),
    );

    await interact(() => {
      resize(60, 20);
      AppStore.getState().uiState.setScreenDimensions({
        width: 60,
        height: 20,
      });
    });
    await settle(renderOnce);

    // too narrow now, so the single line must break into multiple wrapped rows
    const narrowFrame = captureCharFrame();
    expect(narrowFrame).not.toContain(LONG_LINE);
    expect(rowOf(narrowFrame, "visual rows")).toBeGreaterThan(
      rowOf(narrowFrame, "this is a fairly"),
    );

    await interact(() => renderer.destroy());
  });
});
