import Anthropic from "@anthropic-ai/sdk";
import { loadCredentials } from "include/src/credentials";

// Confirms the configured credentials are actually usable before the app
// starts serving requests, rather than failing on the first real request.
// Resolves on success; throws on failure — callers drive their own
// loading/error/success state around this rather than reading it off a
// return value.
export async function verifyCredentials(): Promise<void> {
  const { provider } = loadCredentials();

  switch (provider.llm_provider) {
    case "anthropic":
      await verifyAnthropicCredentials(provider.llm_api_key, provider.model);
      return;
    default:
      throw new Error(`unsupported llm provider: '${provider.llm_provider}'`);
  }
}

// Resolving the model requires a valid, authorized API key, so this alone
// verifies credentials without the cost/latency of an actual completion.
async function verifyAnthropicCredentials(apiKey: string, model: string) {
  const client = new Anthropic({ apiKey });
  await client.models.retrieve(model);
}
