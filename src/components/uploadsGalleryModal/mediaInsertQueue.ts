import { MediaInsertContext, MediaInsertData, MediaInsertStatus } from './types';

/**
 * Ordering policy for media inserts handed to the editor.
 *
 * Inserts rewrite the whole body from JS-side refs, so they are deferred while the
 * user is typing. The subtle part is that a deferral makes ORDER load-bearing: an
 * upload's READY result must never reach the editor before its own "Uploading..."
 * placeholder, or the result finds nothing to replace (the image is dropped) and the
 * placeholder is written afterwards with nothing left to resolve it — the stuck
 * placeholder users report. Hence anything queued forces everything behind it to
 * queue too, however briefly the queue is non-empty.
 *
 * Kept dependency-free so it can be unit-tested without the gallery's native module
 * graph; the container owns only the timers and the actual dispatch.
 */
export const shouldQueueInsert = (isEditing: boolean, pendingCount: number) =>
  isEditing || pendingCount > 0;

const pendingFlushes = new Set<() => void>();

/**
 * Register a "commit whatever is pending, now" callback, and get back its
 * unregister.
 *
 * The editor screen has to be able to drain this work BEFORE it saves. Its own
 * `componentWillUnmount` runs in the commit phase, ahead of every descendant's
 * effect cleanup, so a queue flushed from the gallery's own unmount runs after the
 * screen has already written the draft — the resolved url would reach the body too
 * late for that save. A registry rather than props because the queue sits three
 * components below the screen (screen -> editor view -> toolbar -> gallery).
 */
export const registerPendingFlush = (flush: () => void) => {
  pendingFlushes.add(flush);
  return () => {
    pendingFlushes.delete(flush);
  };
};

/**
 * Run every registered flush. Safe to call with none registered, and safe when
 * another editing surface (the quick-post modal) has one registered too: each
 * callback only commits its own pending work into its own editor.
 */
export const flushPendingEditorWork = () => {
  pendingFlushes.forEach((flush) => {
    try {
      flush();
    } catch (err) {
      // a teardown-time commit must never break the unmount it runs inside
      console.warn('pending editor flush failed', err);
    }
  });
};

/**
 * Advance the set of uploads whose placeholder is in the body but unresolved, and
 * return the context for the batch about to be dispatched.
 *
 * `otherPending` is computed BEFORE the update and excludes this batch's own
 * filenames, so it names exactly the uploads whose placeholders this batch must not
 * touch. The editor refuses to repair an ambiguous placeholder while it is non-empty,
 * which is what stops one upload's url landing in another image's slot.
 */
export const prepareInsertDispatch = (
  inFlight: Set<string>,
  data: MediaInsertData[],
): MediaInsertContext => {
  const batchNames = new Set(data.map((item) => item.filename).filter(Boolean) as string[]);
  const otherPending = [...inFlight].filter((name) => !batchNames.has(name));

  data.forEach((item) => {
    if (!item.filename) {
      return;
    }
    if (item.status === MediaInsertStatus.UPLOADING) {
      inFlight.add(item.filename);
    } else {
      // READY or FAILED: this upload's placeholder is resolved either way
      inFlight.delete(item.filename);
    }
  });

  return { otherPending };
};
