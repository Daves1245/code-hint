// the provider round-trip loop shared by the flows: stream the store's
// conversation, run any tool calls, feed the results back, and repeat until a
// turn produces no tool calls. Flows are stream-option presets over this -
// with no tools the model can't call any, so the loop degenerates to a single
// request/response pass.
import type { FlowEvent, StreamOptions } from "store/src/types";
import { AppStore } from "store";
import * as llm from "../llm";
import {
  runToolCalls,
  toolResultContent,
  type ToolCall,
} from "../tools/orchestrate";

export async function* toolLoop(
  streamOptions: StreamOptions,
): AsyncIterable<FlowEvent> {
  // chatState.history is the conversation: handleSubmit appends the user's
  // message before the flow starts, and each iteration appends the assistant
  // turn and its tool results, so every request just reads the store fresh
  while (true) {
    const chatState = AppStore.getState().chatState;
    const llmStream = llm.stream(chatState.history, streamOptions);
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

    chatState.appendHistory(await llmStream.finalMessage());

    if (toolCalls.length === 0) break;

    const outcomes = await runToolCalls(toolCalls);

    for (const { result } of outcomes) {
      yield { type: "tool-result", result };
    }

    chatState.appendHistory({
      role: "user",
      content: outcomes.map(({ call, result }) => ({
        type: "tool-result" as const,
        toolCallId: call.id,
        ...toolResultContent(result),
      })),
    });
  }

  yield { type: "done" };
}
