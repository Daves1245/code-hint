import { beforeEach, describe, it, expect } from "vitest";
import { testRender } from "@opentui/react/test-utils";
import { TextAttributes, RGBA } from "@opentui/core";
import type { CapturedFrame, CapturedSpan } from "@opentui/core";
import { App } from "../app";
import { AppStore } from "store";
import { resetStore, settle, interact } from "./testHelpers";

// first captured span whose text contains `needle`, searched across all rows
const spanWith = (frame: CapturedFrame, needle: string): CapturedSpan => {
  for (const line of frame.lines) {
    const span = line.spans.find((s) => s.text.includes(needle));
    if (span) return span;
  }
  throw new Error(`no span containing ${JSON.stringify(needle)}`);
};

const isItalic = (span: CapturedSpan) =>
  (span.attributes & TextAttributes.ITALIC) !== 0;

describe("thinking entries", () => {
  beforeEach(() => resetStore());

  it("renders thinking entries muted and italic, and regular text neither", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    AppStore.getState().uiState.setHistory([
      { kind: "text", content: "a regular assistant reply" },
      { kind: "thinking", content: "quietly reasoning about the problem" },
    ]);

    const { renderer, renderOnce, captureSpans } = await testRender(<App />, {
      width: 60,
      height: 20,
    });
    await settle(renderOnce);

    const frame = captureSpans();
    const regular = spanWith(frame, "regular");
    const thinking = spanWith(frame, "reasoning");

    // thinking is italic and muted grey; regular is neither
    expect(isItalic(thinking)).toBe(true);
    expect(isItalic(regular)).toBe(false);
    expect(thinking.fg.toInts().slice(0, 3)).toEqual(
      RGBA.fromHex("#8b949e").toInts().slice(0, 3),
    );
    expect(thinking.fg.toInts()).not.toEqual(regular.fg.toInts());

    await interact(() => renderer.destroy());
  });
});
