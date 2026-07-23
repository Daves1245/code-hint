import { readFile } from "fs/promises";
import { type ToolDefinition, type ReadToolResult } from "store/src/types";

export const read_tool: ToolDefinition = {
  name: "read",
  description:
    "Given a filepath, return the contents of the file pointed to by that path",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path of the file to read",
      },
    },
    required: ["path"],
  },
};

export async function read(path: string): Promise<ReadToolResult> {
  try {
    const contents = await readFile(path, "utf-8");
    return { tool: "read", ok: true, contents };
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    const errMsg = ((): string => {
      switch (nodeError.code) {
        case "ENOENT":
          return "No such file or directory";
        case "EACCES":
          return "You do not have permission to view this file";
        case "EISDIR":
          return "Is a directory";
        default:
          return "Unknown error";
      }
    })();
    return { tool: "read", ok: false, errMsg };
  }
}
