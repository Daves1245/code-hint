// the shared tool loop without thinking: resolve the request via tool calls
import type { Flow, FlowContext } from "store/src/types";
import { read_tool } from "../tools/read";
import { toolLoop } from "./toolLoop";

export function executing(_ctx: FlowContext): Flow {
  return {
    name: "executing",
    run: () => toolLoop({ thinking: false, tools: [read_tool] }),
  };
}
