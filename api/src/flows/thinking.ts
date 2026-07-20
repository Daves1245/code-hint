// like direct, but requests extended thinking from the provider before answering
import type { Flow, FlowContext, FlowEvent } from "store/src/types";

export function thinking(_ctx: FlowContext): Flow {
  return {
    name: "thinking",
    async *run(_input: string): AsyncIterable<FlowEvent> {
      // TODO: call providers/anthropic.stream() with thinking enabled, surface
      // thinking blocks as FlowEvent{type: "thinking"} ahead of the answer
      yield { type: "done" };
    },
  };
}
