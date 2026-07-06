import { describe, it, expect, vi } from "vitest";
import { main } from "../index";

describe("main", () => {
  it("logs a hello world stub", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await main();

    expect(logSpy).toHaveBeenCalledWith("Hello, world!");
    logSpy.mockRestore();
  });
});
