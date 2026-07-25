// drives a tool-call loop against the provider until the request is resolved
import type { Flow, FlowContext, FlowEvent, Message } from "store/src/types";
import * as llm from "../llm";
import { read_tool } from "../tools/read";
import {
  type ToolCall,
  runToolCalls,
  toolResultContent,
} from "../tools/orchestrate";

export function executing(ctx: FlowContext): Flow {
  return {
    name: "executing",
    async *run(input: string): AsyncIterable<FlowEvent> {
      const tools = [read_tool];
      const streamOptions = {
        thinking: false,
        tools,
      };

      let history: Message[] = [...ctx.history, llm.prompt(input)];

      while (true) {
        const llmStream = llm.stream(history, streamOptions);
        const toolCalls: ToolCall[] = [];

        for await (const event of llmStream.events) {
          switch (event.type) {
            case "text":
              yield { type: "text", text: event.text };
              break;
            case "thinking":
              yield { type: "thinking", text: event.text };
              break;
            case "tool-call":
              toolCalls.push(event);
              break;
            case "tool-result":
            case "done":
              break;
          }
        }

        history = [...history, await llmStream.finalMessage()];

        if (toolCalls.length === 0) break;

        const outcomes = await runToolCalls(toolCalls);

        for (const { result } of outcomes) {
          yield { type: "tool-result", result };
        }

        history = [
          ...history,
          {
            role: "user",
            content: outcomes.map(({ call, result }) => ({
              type: "tool-result" as const,
              toolCallId: call.id,
              ...toolResultContent(result),
            })),
          },
        ];
      }

      yield { type: "done" };
    },
  };
}
