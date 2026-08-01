import type {
  ResponseType,
  MemoryToolResult,
  ToolDefinition,
} from "store/src/types";
import { MemoriesSingleton } from "../memory/memories";

export const search_memories_tool: ToolDefinition = {
  name: "search_memories",
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

export async function search_memories(
  project: string,
): Promise<ResponseType<MemoryToolResult>> {
  const memClient = new MemoriesSingleton();
  return memClient.fetch_memories(project);
}

export const upload_memory_tool: ToolDefinition = {
  name: "upload_memory",
  description: "Upload a memory, stored under the given prefix",
  inputSchema: {
    type: "object",
    properties: {
      prefix: {
        type: "string",
        description: "Key to store the memory under",
      },
      content: {
        type: "string",
        description: "Content of the memory",
      },
    },
    required: ["prefix", "content"],
  },
};

export async function upload_memory(
  prefix: string,
  content: string,
): Promise<void> {
  const memClient = new MemoriesSingleton();
  return memClient.upload_memory(prefix, content);
}
