import Anthropic from "@anthropic-ai/sdk";
import type { AnthropicError } from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { loadCredentials } from "include/src/credentials";
import type {
  Message,
  MessageContentBlock,
  LLMEvent,
  LLMStream,
  StreamOptions,
  ToolDefinition,
} from "store/src/types";

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
    case "thinking":
      return {
        type: "thinking",
        thinking: block.thinking,
        signature: block.signature,
      };
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

function fromAnthropicBlock(
  block: Anthropic.ContentBlock,
): MessageContentBlock {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };
    case "thinking":
      return {
        type: "thinking",
        thinking: block.thinking,
        signature: block.signature,
      };
    case "tool_use":
      return {
        type: "tool-call",
        id: block.id,
        name: block.name,
        input: block.input,
      };
    default:
      throw new Error(
        `unsupported anthropic content block type: '${block.type}'`,
      );
  }
}

function fromAnthropicMessage(message: Anthropic.Message): Message {
  return {
    role: message.role,
    content: message.content.map(fromAnthropicBlock),
  };
}

function toAnthropicTool(tool: ToolDefinition): Anthropic.Tool {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  };
}

// bridges the SDK's EventEmitter-style MessageStream onto a plain async
// iterable of generic LLMEvents, so callers never see Anthropic's wire
// format (content-block indices, JSON deltas, snapshots).
function toEvents(raw: MessageStream): AsyncIterable<LLMEvent> {
  type Queued = { event: LLMEvent } | { done: true } | { error: unknown };
  const queue: Queued[] = []; // events received but not consumed yet
  let wake: (() => void) | null = null; // wakes the generator once an item is queued

  const push = (item: Queued) => {
    queue.push(item);
    wake?.();
    wake = null;
  };

  const onText = (delta: string) => push({ event: { type: "text", delta } });
  const onThinking = (delta: string) =>
    push({ event: { type: "thinking", delta } });
  const onContentBlock = (block: Anthropic.ContentBlock) => {
    if (block.type === "tool_use") {
      push({
        event: {
          type: "tool-call",
          id: block.id,
          name: block.name,
          input: block.input,
        },
      });
    }
  };
  const onEnd = () => push({ done: true });
  const onError = (error: AnthropicError) => push({ error });

  raw.on("text", onText);
  raw.on("thinking", onThinking);
  raw.on("contentBlock", onContentBlock);
  raw.on("end", onEnd);
  raw.on("error", onError);

  return (async function* () {
    try {
      while (true) {
        if (queue.length === 0) {
          await new Promise<void>((resolve) => (wake = resolve));
        }
        const item = queue.shift()!;
        if ("done" in item) return;
        if ("error" in item) throw item.error;
        yield item.event;
      }
    } finally {
      raw.off("text", onText);
      raw.off("thinking", onThinking);
      raw.off("contentBlock", onContentBlock);
      raw.off("end", onEnd);
      raw.off("error", onError);
    }
  })();
}

export function stream(
  history: Message[],
  system: string,
  opts: StreamOptions,
): LLMStream {
  const raw = client.messages.stream({
    model: credentials.provider.model,
    max_tokens: credentials.provider.max_tokens,
    system,
    messages: history.map(toAnthropicMessage),
    ...(opts.tools && { tools: opts.tools.map(toAnthropicTool) }),
    ...(opts.thinking && {
      thinking: {
        type: "enabled",
        budget_tokens: credentials.provider.thinking_budget_tokens,
      },
    }),
  });

  return {
    events: toEvents(raw),
    finalMessage: async () => fromAnthropicMessage(await raw.finalMessage()),
  };
}
