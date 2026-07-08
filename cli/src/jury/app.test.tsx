import { describe, it, expect } from "vitest";
import { testRender } from "@opentui/react/test-utils";
import { App } from "../app";
import { AppStore } from "store";

describe("App", () => {
  it("Should say hello when the store has no prompt", async () => {
    const { renderer, captureCharFrame } = await testRender(<App />, {});

    expect(captureCharFrame()).toContain("Hello, world!");
    renderer.destroy();
  });

  it("Should render the prompt from the store", async () => {
    AppStore.getState().chatState.setPrompt("what does this code do?");

    const { renderer, captureCharFrame } = await testRender(<App />, {});

    expect(captureCharFrame()).toContain("what does this code do?");
    renderer.destroy();
    AppStore.getState().chatState.setPrompt("");
  });
});
