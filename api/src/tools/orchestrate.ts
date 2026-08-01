// tool-call orchestration shared by every flow that runs tools (see NOTES
// # tools): each call maps to a Scope - the canonicalized paths it may touch
// and how. two calls conflict iff their scopes overlap and at least one
// access is a write; conflicting calls run in arrival order (the model's
// intent), everything else in parallel. the conflict DAG is never built
// explicitly - each call just awaits the promises of the earlier calls it
// conflicts with, which is acyclic by construction since a call can only
// wait on calls dispatched before it.
import { resolve } from "path";
import type { Scope, ToolResult } from "store/src/types";
import { read_tool, read } from "./read";
import {
  search_memories_tool,
  search_memories,
  upload_memory_tool,
  upload_memory,
} from "./remember";

export interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

// string identity == data identity only after canonicalization: rel vs abs,
// '.'/'..' segments, and APFS's default case-insensitivity (Foo.txt ==
// foo.txt). TODO: symlinks (realpath) and hardlinks (inode identity) are
// known holes - neither is resolvable by path-string comparison alone.
function canonicalize(path: string): string {
  return resolve(path).toLowerCase();
}

// ancestor-subsumes-descendant on canonical paths: touching a directory
// touches everything under it. the trailing "/" guard keeps /repo/dir from
// falsely subsuming /repo/dirty.
function isAncestor(a: string, b: string): boolean {
  return b.startsWith(a.endsWith("/") ? a : a + "/");
}

export function overlaps(a: string, b: string): boolean {
  return a === b || isAncestor(a, b) || isAncestor(b, a);
}

// the only real conflicts are write-involving pairs (RW/WR/WW) on
// overlapping data; two reads never need ordering.
export function conflicts(a: Scope, b: Scope): boolean {
  return a.some((x) =>
    b.some(
      (y) =>
        (x.mode === "write" || y.mode === "write") && overlaps(x.path, y.path),
    ),
  );
}

// the data a call may touch, determined before running it. tools without a
// statically knowable footprint fall through to the pessimistic root write,
// which overlaps everything and so serializes against all other calls.
function scopeOf(call: ToolCall): Scope {
  switch (call.name) {
    case read_tool.name: {
      const path = (call.input as { path?: unknown } | null)?.path;
      // invalid input never touches the fs (runTool rejects it before I/O)
      if (typeof path !== "string") return [];
      return [{ path: canonicalize(path), mode: "read" }];
    }
    default:
      return [{ path: "/", mode: "write" }];
  }
}

async function runTool(name: string, input: unknown): Promise<ToolResult> {
  switch (name) {
    case read_tool.name: {
      const path = (input as { path?: unknown } | null)?.path;
      if (typeof path !== "string") {
        return {
          tool: "read",
          ok: false,
          errMsg: "the 'read' tool requires a string 'path' argument",
        };
      }
      return read(path);
    }
    case search_memories_tool.name: {
      const project = (input as { project?: unknown } | null)?.project;
      if (typeof project !== "string") {
        return {
          tool: "search_memories",
          ok: false,
          errMsg: "the 'search_memories' tool requires a string 'project' argument",
        };
      }
      const response = await search_memories(project);
      return response.status === "ok"
        ? { tool: "search_memories", ok: true, memories: response.data.memories }
        : { tool: "search_memories", ok: false, errMsg: response.errmsg };
    }
    case upload_memory_tool.name: {
      const prefix = (input as { prefix?: unknown } | null)?.prefix;
      const content = (input as { content?: unknown } | null)?.content;
      if (typeof prefix !== "string" || typeof content !== "string") {
        return {
          tool: "upload_memory",
          ok: false,
          errMsg:
            "the 'upload_memory' tool requires string 'prefix' and 'content' arguments",
        };
      }
      await upload_memory(prefix, content);
      return { tool: "upload_memory", ok: true };
    }
    default:
      // shouldn't happen: the provider can only call tools flows register
      throw new Error(`unknown tool call from provider: '${name}'`);
  }
}

// the content/isError a tool's result becomes in the tool_result message
// fed back to the provider
export function toolResultContent(result: ToolResult): {
  content: string;
  isError: boolean;
} {
  switch (result.tool) {
    case "read":
      return result.ok
        ? { content: result.contents, isError: false }
        : { content: result.errMsg, isError: true };
    case "search_memories":
      return result.ok
        ? { content: JSON.stringify(result.memories), isError: false }
        : { content: result.errMsg, isError: true };
    case "upload_memory":
      return result.ok
        ? { content: "ok", isError: false }
        : { content: result.errMsg, isError: true };
  }
}

// runs one assistant turn's batch of tool calls under the scheduling model
// above; resolves with an outcome per call, in arrival order.
export async function runToolCalls(
  toolCalls: ToolCall[],
): Promise<{ call: ToolCall; result: ToolResult }[]> {
  const scheduled: {
    call: ToolCall;
    scope: Scope;
    promise: Promise<ToolResult>;
  }[] = [];

  for (const call of toolCalls) {
    const scope = scopeOf(call);
    const preds = scheduled
      .filter((prev) => conflicts(prev.scope, scope))
      .map((prev) => prev.promise);
    // allSettled: an upstream failure must not wipe out this call's result -
    // the model expects a tool_result for every tool_use_id it sent
    const promise = Promise.allSettled(preds).then(() =>
      runTool(call.name, call.input),
    );
    scheduled.push({ call, scope, promise });
  }

  return Promise.all(
    scheduled.map(async ({ call, promise }) => ({
      call,
      result: await promise,
    })),
  );
}
