// thin wrapper around stream(): no planning, no tools, just answer the prompt
import type { Flow, FlowContext, FlowEvent } from "store/src/types";

export function direct(_ctx: FlowContext): Flow {
  return {
    name: "direct",
    async *run(_input: string): AsyncIterable<FlowEvent> {
      // TODO: call providers/anthropic.stream(input, ctx.history), map the
      // resulting message stream onto FlowEvent (text/thinking/done)
      yield { type: "done" };
    },
  };
}
