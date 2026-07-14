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
  }),
  logger: z
    .object({
      level: z.string().default("info"),
    })
    .default({ level: "info" }),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export function loadCredentials() {
  const fileContents = fs.readFileSync(credentialsPath, "utf-8");
  const toml = parse(fileContents);
  const credentials = credentialsSchema.parse(toml);
  return credentials;
}
