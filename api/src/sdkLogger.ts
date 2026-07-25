import type { Logger } from "@anthropic-ai/sdk/client";

// The SDK binds and caches the logger's methods the first time a client logs
// (keyed per logger object). Handing it `console` directly freezes whatever
// the console methods were at that moment — for module-scope clients that's
// before opentui's console capture patches them, so ANTHROPIC_LOG output would
// bypass the TUI console and corrupt the screen. These wrappers resolve the
// console methods at call time instead, so they always hit the live ones.
export const sdkLogger: Logger = {
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.info(...args),
  debug: (...args) => console.debug(...args),
};
