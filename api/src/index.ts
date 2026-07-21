import { verifyCredentials } from "./auth";

export { direct } from "./flows/direct";

export async function apiInit(): Promise<void> {
  return verifyCredentials();
}
