import { verifyCredentials } from "./auth";

export { direct } from "./flows/direct";
export { thinking } from "./flows/thinking";
export { planning } from "./flows/planning";
export { executing } from "./flows/executing";

export async function apiInit(): Promise<void> {
  return verifyCredentials();
}
