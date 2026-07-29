import { createHash } from "crypto";
import type { CodeChunk } from "store/src/types";
import { loadCredentials } from "include/src/credentials";

// naive fixed-size chunking, kept deliberately dumb and cheap - real
// explainability-based splitting (regexes indexed by line, large obvious
// functions kept whole) is LogicChunk's job once treesitter is wired in.
const credentials = loadCredentials();
const chunk_size = credentials.qdrant.chunk_size;
const chunk_overlap = credentials.qdrant.chunk_overlap;

export function chunkCode(
  project: string,
  path: string,
  content: string,
): CodeChunk[] {
  const chunks: CodeChunk[] = [];
  const step = chunk_size - chunk_overlap;
  for (let start = 0; start < content.length; start += step) {
    const end = Math.min(start + chunk_size, content.length);
    const chunkContent = content.slice(start, end);
    chunks.push({
      project,
      path,
      start,
      end,
      contentHash: createHash("sha256").update(chunkContent).digest("hex"),
      content: chunkContent,
    });
    if (end === content.length) break;
  }
  return chunks;
}
