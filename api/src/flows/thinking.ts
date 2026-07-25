// the shared tool loop with extended thinking requested from the provider
import type { Flow, FlowContext } from "store/src/types";
import { read_tool } from "../tools/read";
import { toolLoop } from "./toolLoop";

export function thinking(_ctx: FlowContext): Flow {
  return {
    name: "thinking",
    run: () => toolLoop({ thinking: true, tools: [read_tool] }),
  };
}
