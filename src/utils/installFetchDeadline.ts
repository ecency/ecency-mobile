// Install the fetch deadline on the global, once.
//
// Imported for its side effect from index.js, after ./abortSignalPolyfill and
// before ./App. @ecency/sdk binds `globalThis.fetch` on first use and caches the
// bound reference, so the wrapper has to be in place before the first SDK call.
//
// The guard is a module-level flag, not a marker on `globalThis.fetch`. Sentry's
// instrumentation re-assigns the global at `Sentry.init` time (App.tsx), so a
// marker read off the current global would not survive that and a second install
// would stack a second deadline.

import { withDeadline } from './networkTimeout';

let installed = false;

export const installFetchDeadline = (): void => {
  if (installed) {
    return;
  }

  const current = globalThis.fetch;
  if (typeof current !== 'function') {
    return;
  }

  installed = true;
  globalThis.fetch = withDeadline(current);
};

installFetchDeadline();
