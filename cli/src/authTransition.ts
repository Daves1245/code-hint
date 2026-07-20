import { startTransition } from "react";
import { AppStore } from "store";
import { apiInit } from "api";

// Drives authState through Loadable's idle -> loading -> error|success
// states around the (long-running, network-bound) credential check. Each
// state change is dispatched inside startTransition so the UI update it
// triggers doesn't block on the store update itself.
export async function runAuthTransition() {
  const taskId = crypto.randomUUID();

  startTransition(() => {
    AppStore.getState().setAuthState({ status: "loading", taskId });
  });

  try {
    await apiInit();
    startTransition(() => {
      AppStore.getState().setAuthState({ status: "success", data: null });
    });
  } catch (err) {
    startTransition(() => {
      AppStore.getState().setAuthState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    });
  }
}
