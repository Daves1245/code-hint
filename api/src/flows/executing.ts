// drives a tool-call loop against the provider until the request is resolved
import type { Flow, FlowContext, FlowEvent, Message, ToolResult } from "store/src/types";
import * as llm from "../llm"
import { read_tool, read } from "../tools/read";

function runTool(name: string, input: unknown): ToolResult {
    switch (name) {
        case "read": {
            const path = (input as { path?: unknown } | null)?.path;
            if (typeof path !== "string") {
                return {
                    tool: "read",
                    ok: false,
                    errMsg: "the 'read' tool requires a string 'path' argument",
                };
            }
            return read(path);
        }
        default:
            // shouldn't happen: the provider can only call tools we register below
            throw new Error(`unknown tool call from provider: '${name}'`);
    }
}

// the content/isError a tool's result becomes in the tool_result message
// fed back to the provider
function toolResultContent(result: ToolResult): { content: string; isError: boolean } {
    switch (result.tool) {
        case "read":
            return result.ok
                ? { content: result.contents, isError: false }
                : { content: result.errMsg, isError: true };
    }
}

export function executing(ctx: FlowContext): Flow {
  return {
    name: "executing",
    async *run(input: string): AsyncIterable<FlowEvent> {
        const tools = [ read_tool ]
        const streamOptions = {
            thinking: false,
            tools
        }

        let history: Message[] = [...ctx.history, llm.prompt(input)];

        while (true) {
            const llmStream = llm.stream(history, streamOptions);
            const toolCalls: { id: string; name: string; input: unknown }[] = [];

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

            const outcomes = toolCalls.map((call) => ({
                call,
                result: runTool(call.name, call.input),
            }));

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
