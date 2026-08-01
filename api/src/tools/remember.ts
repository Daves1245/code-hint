import type {
  ResponseType,
  MemoryToolResult,
  ToolDefinition,
} from "store/src/types";
import { MemoriesSingleton } from "../memory/memories";

export const memories_tool: ToolDefinition = {
  name: "memories",
  description: "Fetch memories, possibly related to a project",
  inputSchema: {
    type: "object",
    properties: {
      project: {
        type: "string",
        description:
          "Project from which to read memories. Returns memories for all projects if left blank",
      },
    },
    required: ["project"],
  },
};

export async function memories(
  project: string,
): Promise<ResponseType<MemoryToolResult>> {
  const memClient = new MemoriesSingleton();
  return memClient.fetch_memories(project);
}
