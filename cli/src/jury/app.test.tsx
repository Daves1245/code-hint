import { beforeEach, describe, it, expect } from "vitest";
import { testRender } from "@opentui/react/test-utils";
import { App } from "../app";
import { AppStore } from "store";
import { resetStore, settle, interact } from "./testHelpers";

describe("App", () => {
  beforeEach(() => {
    resetStore();
  });

  it("mounts with an empty history and no crash", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <App />,
      { width: 60, height: 20 },
    );
    await settle(renderOnce);

    // a real frame was rendered (not the uninitialized buffer), and the
    // outer chrome is in place
    expect(captureCharFrame()).toContain("┌");
    expect(AppStore.getState().uiState.history).toEqual([]);

    await interact(() => renderer.destroy());
  });

  it("appends submitted input to history and displays it", async () => {
    AppStore.getState().uiState.setScreenDimensions({ width: 60, height: 20 });
    const { renderer, mockInput, renderOnce, captureCharFrame } =
      await testRender(<App />, { width: 60, height: 20 });
    await settle(renderOnce);

    await interact(() => mockInput.typeText("what does this code do?"));
    await interact(() => mockInput.pressEnter());
    await settle(renderOnce);

    expect(captureCharFrame()).toContain("what does this code do?");
    expect(AppStore.getState().uiState.history).toEqual([
      "what does this code do?",
    ]);

    await interact(() => renderer.destroy());
  });
});
