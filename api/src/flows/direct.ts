// thin wrapper around stream(): no planning, no tools, just answer the prompt
import type { Flow, FlowContext, FlowEvent } from "store/src/types";
import * as llm from "../llm";

export function direct(ctx: FlowContext): Flow {
  return {
    name: "direct",
    async *run(input: string): AsyncIterable<FlowEvent> {
      const llmStream = llm.stream([...ctx.history, llm.prompt(input)]);

      for await (const event of llmStream.events) {
        switch (event.type) {
          case "text":
            yield { type: "text", text: event.delta };
            break;
          case "thinking":
            yield { type: "thinking", text: event.delta };
            break;
          case "tool-call":
            // direct requests no tools, so the provider shouldn't emit these
            break;
        }
      }

      yield { type: "done" };
    },
  };
}
