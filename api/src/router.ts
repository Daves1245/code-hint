import type { ChatMode, Flow, FlowContext } from "store/src/types";
import { direct } from "./flows/direct";
import { thinking } from "./flows/thinking";
import { planner } from "./flows/planner";
import { executor } from "./flows/executor";

const flows: Record<ChatMode, (ctx: FlowContext) => Flow> = {
  direct,
  thinking,
  planning: planner,
  executing: executor,
};

export function route(_prompt: string, ctx: FlowContext): Flow {
  // XXX
  // consider either running a smaller model on the prompt
  // to determine if planning is necessary, needs tool calls, etc.
  // or
  // simple /plan, etc. text at the beginning (fastest to implement & test)
  // for now with testing, we'll just hard-code a mode
  const mode: ChatMode = "executing";

  return flows[mode](ctx);
}
