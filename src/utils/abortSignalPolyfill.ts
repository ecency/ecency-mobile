// Polyfill `AbortSignal.timeout` and `AbortSignal.any` for React Native (Hermes).
// The Ecency SDK uses these in `withTimeoutSignal`, and missing them causes
// every internal API call (e.g. /search-api/search) to throw before fetch fires,
// which surfaces as silent empty results in the UI.

declare global {
  interface AbortSignalConstructor {
    timeout?: (ms: number) => AbortSignal;
    any?: (signals: AbortSignal[]) => AbortSignal;
  }
}

const AbortSignalRef: any = typeof AbortSignal !== 'undefined' ? AbortSignal : undefined;

if (AbortSignalRef && typeof AbortSignalRef.timeout !== 'function') {
  AbortSignalRef.timeout = (ms: number): AbortSignal => {
    const controller: any = new AbortController();
    setTimeout(() => {
      try {
        controller.abort(new Error('TimeoutError'));
      } catch {
        controller.abort();
      }
    }, ms);
    return controller.signal;
  };
}

if (AbortSignalRef && typeof AbortSignalRef.any !== 'function') {
  AbortSignalRef.any = (signals: AbortSignal[]): AbortSignal => {
    const controller: any = new AbortController();
    const list = signals as any[];
    const aborted = list.find((s) => s.aborted);
    if (aborted) {
      try {
        controller.abort(aborted.reason);
      } catch {
        controller.abort();
      }
      return controller.signal;
    }
    list.forEach((signal) => {
      signal.addEventListener(
        'abort',
        () => {
          if (controller.signal.aborted) return;
          try {
            controller.abort(signal.reason);
          } catch {
            controller.abort();
          }
        },
        { once: true },
      );
    });
    return controller.signal;
  };
}

export {};
