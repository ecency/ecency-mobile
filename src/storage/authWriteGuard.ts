/**
 * Keeps a late credential write from undoing a logout.
 *
 * A token refresh reads, waits on the network, then writes the renewed credentials. A
 * logout that wipes storage around it would see them written straight back
 * (setSCAccount creates the entry when it is missing). Both run on the one JS thread,
 * so three rules close every interleaving:
 *
 *   1. A removal marks itself active and bumps the account's epoch before anything
 *      else, then waits for guarded writes already under way, then removes, and bumps
 *      the epoch again when it is done.
 *   2. A refresh takes the epoch before its first await (authEpoch) and writes through
 *      guardedAuthWrite.
 *   3. guardedAuthWrite refuses while a removal of the account is active, and when the
 *      epoch moved since it was taken.
 *
 * So a refresh that started before a removal, or during one, never writes after it; a
 * write that was already running finishes before the removal clears storage; and a
 * refresh that starts after the removal finds nothing stored to renew.
 */

let allEpoch = 0;
let allActive = 0;
const accountEpochs = new Map<string, number>();
const accountActive = new Map<string, number>();
const pending = new Set<Promise<unknown>>();

const bump = (map: Map<string, number>, username: string, by: number) =>
  map.set(username, (map.get(username) ?? 0) + by);

/** The removal state an account's credentials were read under. */
export const authEpoch = (username: string): string =>
  `${allEpoch}:${accountEpochs.get(username) ?? 0}`;

const removalActive = (username: string) => allActive > 0 || (accountActive.get(username) ?? 0) > 0;

/**
 * Write credentials for `username`, unless a removal of that account (or of all
 * accounts) is under way or happened since `epoch` was taken. Resolves to null when
 * skipped.
 */
export const guardedAuthWrite = async <T>(
  username: string,
  epoch: string,
  write: () => Promise<T>,
): Promise<T | null> => {
  if (removalActive(username) || authEpoch(username) !== epoch) return null;
  const running = write();
  pending.add(running);
  try {
    return await running;
  } finally {
    pending.delete(running);
  }
};

/**
 * Run `remove`, which deletes stored credentials of `username` (of all accounts when
 * omitted), so that no guarded write for them lands after it: see the rules above.
 */
export const withAuthRemoval = async <T>(
  username: string | undefined,
  remove: () => Promise<T>,
): Promise<T> => {
  const mark = (by: number) => {
    if (username) {
      bump(accountActive, username, by);
      bump(accountEpochs, username, 1);
    } else {
      allActive += by;
      allEpoch += 1;
    }
  };
  mark(1);
  try {
    await Promise.allSettled([...pending]);
    return await remove();
  } finally {
    // Bumped again: a refresh that took the epoch while this ran is stale now too.
    mark(-1);
  }
};
