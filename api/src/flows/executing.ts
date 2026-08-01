// the shared tool loop without thinking: resolve the request via tool calls
import type { Flow, FlowContext } from "store/src/types";
import { read_tool } from "../tools/read";
import { search_memories_tool, upload_memory_tool } from "../tools/remember";
import { toolLoop } from "./toolLoop";

export function executing(_ctx: FlowContext): Flow {
  return {
    name: "executing",
    run: () =>
      toolLoop({
        thinking: false,
        tools: [read_tool, search_memories_tool, upload_memory_tool],
      }),
  };
}
