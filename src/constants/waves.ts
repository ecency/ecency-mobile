/**
 * Hive accounts that host waves (short-content) "containers".
 *
 * A waves container is a root post published by the host account; individual
 * waves are comments on that container. Following the cross-team unification
 * of ecency.waves and peak.snaps under the shared `hive.flow` account, the
 * feed reads from the primary host first and falls back to the next host when
 * the primary has no containers, or its containers are exhausted while
 * scrolling. New waves are likewise posted to the first host that has a
 * container, so they appear at the top of the primary feed.
 *
 * Order matters: earlier entries take precedence. Keep `ecency.waves` last as
 * the legacy backstop so historical waves remain reachable.
 */
export const WAVES_PRIMARY_HOST = 'hive.flow';
export const WAVES_FALLBACK_HOST = 'ecency.waves';

export const WAVES_HOSTS: readonly string[] = [WAVES_PRIMARY_HOST, WAVES_FALLBACK_HOST];

/**
 * True when `account` is one of the recognised waves container hosts. Use this
 * instead of comparing against a single hard-coded host so that waves served
 * from any unified container account are classified correctly.
 */
export const isWavesHost = (account?: string | null): boolean =>
  !!account && WAVES_HOSTS.includes(account);
