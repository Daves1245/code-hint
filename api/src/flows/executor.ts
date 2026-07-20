// drives a tool-call loop against the provider until the request is resolved
import type { Flow, FlowContext, FlowEvent } from "store/src/types";

export function executor(_ctx: FlowContext): Flow {
  return {
    name: "executing",
    async *run(_input: string): AsyncIterable<FlowEvent> {
      // TODO: call providers/anthropic.stream() with tools, loop on
      // tool-call/tool-result events until the provider returns a final answer
      yield { type: "done" };
    },
  };
}
