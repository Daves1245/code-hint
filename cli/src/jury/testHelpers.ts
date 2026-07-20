import { act } from "react";
import { AppStore } from "store";

export function resetStore() {
  AppStore.getState().chatState.setPrompt("");
  AppStore.getState().chatState.setHistory([]);
  AppStore.getState().uiState.setHistory([]);
  AppStore.getState().uiState.setFocusedId("input");
  AppStore.getState().uiState.setInputHeight(5);
  AppStore.getState().uiState.setHistoryContentHeight(2);
}

// onSizeChange-driven state updates (typing, submitting, resizing) settle
// over a couple of render passes rather than in the triggering frame itself;
// waitForVisualIdle() is unusable here because the focused textarea's
// blinking cursor keeps producing new frames and it never reports idle.
// Wrapped in act() so the resulting store/React updates are flushed before
// the next assertion runs, instead of leaking into a later, unrelated act().
export async function settle(renderOnce: () => Promise<void>) {
  await act(async () => {
    for (let i = 0; i < 3; i++) await renderOnce();
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
