import { parse } from "smol-toml";
import { z } from "zod";
import fs from "fs";

const credentialsSchema = z.object({
  llm_provider: z.string(),
  llm_api_key: z.string(),
  logger_level: z.string().default("info"),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export function loadCredentials() {
  const fileContents = fs.readFileSync("./credentials.toml", "utf-8");
  const toml = parse(fileContents);
  const credentials = credentialsSchema.parse(toml);
  return credentials;
}
