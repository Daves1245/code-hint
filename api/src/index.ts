import { verifyCredentials } from "./auth";

export async function apiInit(): Promise<void> {
  return verifyCredentials();
}
