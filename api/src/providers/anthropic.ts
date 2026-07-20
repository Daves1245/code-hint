import Anthropic from "@anthropic-ai/sdk";
import { loadCredentials } from "include/src/credentials";
import type { Message, MessageContentBlock } from "store/src/types";

const credentials = loadCredentials();

const client = new Anthropic({
  apiKey: credentials.provider.llm_api_key,
});

export function init() {
  if (credentials.provider.llm_provider !== "anthropic") {
    throw "calling anthropic with misconfigured credentials";
  }
}

function toAnthropicBlock(
  block: MessageContentBlock,
): Anthropic.ContentBlockParam {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };
    case "tool-call":
      return {
        type: "tool_use",
        id: block.id,
        name: block.name,
        input: block.input,
      };
    case "tool-result":
      return {
        type: "tool_result",
        tool_use_id: block.toolCallId,
        content: block.content,
        ...(block.isError !== undefined && { is_error: block.isError }),
      };
  }
}

function toAnthropicMessage(message: Message): Anthropic.MessageParam {
  return {
    role: message.role,
    content:
      typeof message.content === "string"
        ? message.content
        : message.content.map(toAnthropicBlock),
  };
}

export async function stream(input: string, history: Message[]) {
  const messages = [
    ...history.map(toAnthropicMessage),
    { role: "user" as const, content: input },
  ];

  return client.messages.stream({
    model: credentials.provider.model,
    max_tokens: 16000,
    messages,
  });
}
