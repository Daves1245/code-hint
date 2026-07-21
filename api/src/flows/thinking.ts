// like direct, but requests extended thinking from the provider before answering
import type { Flow, FlowContext, FlowEvent } from "store/src/types";
import * as llm from "../llm";

export function thinking(ctx: FlowContext): Flow {
  return {
    name: "thinking",
    async *run(input: string): AsyncIterable<FlowEvent> {
      const llmStream = llm.stream([...ctx.history, llm.prompt(input)], {
        thinking: true,
      });

      for await (const event of llmStream.events) {
        switch (event.type) {
          case "text":
            yield { type: "text", text: event.delta };
            break;
          case "thinking":
            yield { type: "thinking", text: event.delta };
            break;
          case "tool-call":
            // thinking requests no tools, so the provider shouldn't emit these
            break;
        }
      }

      yield { type: "done" };
    },
  };
}
