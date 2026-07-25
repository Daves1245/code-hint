// the shared tool loop with no tools: a single request/response pass
import type { Flow, FlowContext } from "store/src/types";
import { toolLoop } from "./toolLoop";

export function direct(_ctx: FlowContext): Flow {
  return {
    name: "direct",
    run: () => toolLoop({}),
  };
}
