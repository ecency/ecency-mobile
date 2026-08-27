/**
 * Which body a draft save should write.
 *
 * `_handleFormUpdate` records the body it was handed before it awaits metadata
 * extraction, so on the unmount path the component's state is still a step behind
 * it. The save has to prefer that recorded value, or a body committed moments
 * earlier — the last keystrokes of a debounce window, or an upload result drained
 * on the way out — is dropped from the saved draft.
 *
 * It must prefer it ONLY while that update is still in flight, though. Once it has
 * landed in state the recorded value is just a copy, and something else may have
 * replaced the body since without going through `_handleFormUpdate` at all: a
 * clear resets it to empty, and a draft arriving asynchronously overwrites it via
 * derived state. Preferring a stale copy in either case would put the cleared or
 * replaced text back into the saved draft.
 *
 * Kept dependency-free so it can be unit-tested without the editor screen's module
 * graph.
 */
export const resolveDraftSaveBody = (
  stateBody: string | undefined,
  recordedBody: string | undefined,
  isRecordedPending: boolean,
): string | undefined => {
  if (isRecordedPending && typeof recordedBody === 'string') {
    return recordedBody;
  }
  return stateBody;
};
