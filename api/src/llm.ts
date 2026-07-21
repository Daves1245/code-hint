import type {
  Message,
  LLMEvent,
  ToolDefinition,
  StreamOptions,
  LLMStream,
} from "store/src/types";
import { loadCredentials } from "include/src/credentials";
import * as anthropic from "./providers/anthropic";

const credentials = loadCredentials();

export const SYSTEM_PROMPT = `You are code-hint, a coding assistant running in a terminal.`;

// wrap raw user text into the Message shape flows append to history before calling stream()
export function prompt(input: string): Message {
  return { role: "user", content: input };
}

// flow calls this instead of provider-specific functions for a standard interface
export function stream(
  history: Message[],
  opts: StreamOptions = {},
): LLMStream {
  switch (credentials.provider.llm_provider) {
    case "anthropic":
      return anthropic.stream(history, SYSTEM_PROMPT, opts);
    default:
      throw new Error(
        `unsupported llm provider: '${credentials.provider.llm_provider}'`,
      );
  }
}
