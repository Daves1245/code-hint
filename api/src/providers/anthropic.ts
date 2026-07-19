import Anthropic from "@anthropic-ai/sdk";
import { loadCredentials } from "include/src/credentials";

const credentials = loadCredentials();

const client = new Anthropic({
  apiKey: credentials.provider.llm_api_key,
});

export function init() {
  if (credentials.provider.llm_provider !== "anthropic") {
    throw "calling anthropic with misconfigured credentials";
  }
}

export async function stream() {
  return client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    messages: [{ role: "user", content: "" }],
  });
}
