import { readFile, readFileSync } from "fs";
import { type ToolDefinition, type FlowEvent } from "store/src/types";

const read_tool: ToolDefinition = {
    name: "read",
    description: "Given a filepath, return the contents of the file pointed to by that path",
    inputSchema: {
        type: "object",
        properties: {
            "path": "Path of the file to read",
            required: "path"
        }
    }
};

export function read(path: string): FlowEvent {
    let contents;
    try {
        contents = readFileSync(path);
    } catch (error: unknown) {
        const errMsg = ((): string => {
            const nodeError = error as NodeJS.ErrnoException;
            switch (nodeError.code) {
                case 'ENOENT':
                    return "No such file or directory";
                case 'EACCESS':
                    return "You do not have permission to view this file";
                case 'EISDIR':
                    return "Is a directory";
                default:
                    return "Unknown error";
                    break;
            }
        })();
        return {type: "tool-result", result: { errMsg }, isError: true };
    }
    return {type: "tool-result", result: { "contents": contents }}
}
