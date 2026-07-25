import { act } from "react";
import { AppStore } from "store";

export function resetStore() {
  AppStore.getState().chatState.setPrompt("");
  AppStore.getState().chatState.setHistory([]);
  AppStore.getState().chatState.setMode("executing");
  AppStore.getState().uiState.setHistory([]);
  AppStore.getState().uiState.setFocusedId("input");
  AppStore.getState().uiState.setInputHeight(5);
  AppStore.getState().setAuthState({ status: "idle" });
}

// onSizeChange-driven state updates (typing, submitting, resizing) settle
// over a couple of render passes rather than in the triggering frame itself;
// waitForVisualIdle() is unusable here because the focused textarea's
// blinking cursor keeps producing new frames and it never reports idle.
//
// The <markdown> renderers in the history pane parse/highlight on a worker, so
// their text and measured height only land after the event loop turns over -
// back-to-back renderOnce() calls in a tight loop never give that work a
// chance to complete. Yielding with a real timer between passes lets the
// worker deliver, and the following renderOnce() paints the result.
//
// Wrapped in act() so the resulting store/React updates are flushed before
// the next assertion runs, instead of leaking into a later, unrelated act().
export async function settle(renderOnce: () => Promise<void>) {
  await act(async () => {
    for (let i = 0; i < 5; i++) {
      await renderOnce();
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    await renderOnce();
  });
}

// Wraps a mock-input/resize interaction (and the store or React updates it
// triggers) in act(), so those updates are flushed synchronously instead of
// producing "update was not wrapped in act(...)" warnings.
export async function interact(fn: () => void | Promise<void>) {
  await act(async () => {
    await fn();
  });
}
