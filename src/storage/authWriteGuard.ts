/**
 * Keeps a late credential write from undoing a logout.
 *
 * A token refresh reads, waits on the network, then writes the renewed credentials. A
 * logout that wipes storage in between would see them written straight back (setSCAccount
 * creates the entry when it is missing). Both run on the one JS thread, so it is enough
 * that every removal first marks itself (synchronously) and then waits for writes already
 * running, and that every guarded write checks the mark just before it starts:
 *
 *   removal:  beginAuthRemoval(name)  -> later writes for that account are skipped
 *                                      -> waits for writes already under way
 *             ...then removes
 *   refresh:  epoch = authEpoch(name) before the network call
 *             guardedAuthWrite(name, epoch, write) -> skipped if a removal began since
 *
 * So a write either completes before the removal clears storage, or never starts.
 */

let allEpoch = 0;
const accountEpochs = new Map<string, number>();
const pending = new Set<Promise<unknown>>();

/** The removal state an account's credentials were read under. */
export const authEpoch = (username: string): string =>
  `${allEpoch}:${accountEpochs.get(username) ?? 0}`;

/**
 * Write credentials for `username`, unless a removal of that account (or of all
 * accounts) began since `epoch` was taken. Resolves to null when skipped.
 */
export const guardedAuthWrite = async <T>(
  username: string,
  epoch: string,
  write: () => Promise<T>,
): Promise<T | null> => {
  if (authEpoch(username) !== epoch) return null;
  const running = write();
  pending.add(running);
  try {
    return await running;
  } finally {
    pending.delete(running);
  }
};

/**
 * Call first in anything that removes stored credentials: no guarded write for the
 * account (all accounts when `username` is omitted) starts after this, and the ones
 * already running are waited for.
 */
export const beginAuthRemoval = async (username?: string): Promise<void> => {
  if (username) {
    accountEpochs.set(username, (accountEpochs.get(username) ?? 0) + 1);
  } else {
    allEpoch += 1;
  }
  await Promise.allSettled([...pending]);
};
