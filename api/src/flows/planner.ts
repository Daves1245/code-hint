// breaks the request into a plan before any execution happens
import type { Flow, FlowContext, FlowEvent } from "store/src/types";

export function planner(_ctx: FlowContext): Flow {
  return {
    name: "planning",
    async *run(_input: string): AsyncIterable<FlowEvent> {
      // TODO: prompt the provider for a plan, emit it as text, then hand off
      // to executor() for the steps that need tool calls
      yield { type: "done" };
    },
  };
}
