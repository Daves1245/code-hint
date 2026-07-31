import { parse } from "smol-toml";
import { z } from "zod";
import fs from "fs";
import path from "path";

// XXX: cwd-independent path resolution as a stopgap; revisit when credentials
// migrates to a proper settings/config module.
const credentialsPath = path.join(
  import.meta.dirname,
  "../credentials/credentials.toml",
);

const credentialsSchema = z.object({
  provider: z.object({
    llm_provider: z.string(),
    llm_api_key: z.string(),
    model: z.string(),
    max_tokens: z.number().int().positive().default(16000),
    // must be >= 1024 and < max_tokens
    thinking_budget_tokens: z.number().int().min(1024).default(8000),
  }),
  logger: z
    .object({
      level: z.string().default("info"),
    })
    .default({ level: "info" }),
  qdrant: z.object({
    url: z.string().url(),
    // chars per chunk for the code/logic chunkers; tune once real content
    // sizes are in
    chunk_size: z.number().int().positive().default(2000),
    // chars shared between consecutive chunks, so a span that would land on
    // a boundary keeps some surrounding context on both sides. must be <
    // chunk_size
    chunk_overlap: z.number().int().nonnegative().default(200),
  }),
  s3: z.object({
    bucket: z.string(),
    region: z.string(),
  }),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export function loadCredentials() {
  const fileContents = fs.readFileSync(credentialsPath, "utf-8");
  const toml = parse(fileContents);
  const credentials = credentialsSchema.parse(toml);
  return credentials;
}
