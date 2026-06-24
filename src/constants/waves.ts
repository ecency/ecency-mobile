/**
 * Hive accounts that host waves (short-content) "containers".
 *
 * A waves container is a root post published by the host account; individual
 * waves are comments on that container. The unified waves feed merges every
 * container below in time order, so a wave in the feed can belong to any of
 * them — not just the accounts Ecency posts new waves into.
 */

/**
 * Hosts Ecency posts NEW waves into, in priority order. A freshly posted wave
 * lands on the first host that has a live container (`hive.flow`), falling back
 * to the legacy `ecency.waves`. Keep `ecency.waves` last as the backstop so
 * historical waves remain reachable.
 */
export const WAVES_PRIMARY_HOST = 'hive.flow';
export const WAVES_FALLBACK_HOST = 'ecency.waves';

export const WAVES_HOSTS: readonly string[] = [WAVES_PRIMARY_HOST, WAVES_FALLBACK_HOST];

/**
 * Every account whose root posts are waves containers, across all integrated
 * apps. The unified feed surfaces waves from ALL of these, so post/comment
 * views must recognise any of them as a wave (not just the accounts we post
 * into). Keep in sync with the backend (esync) container set and the web's
 * `CONTAINER_ACCOUNTS`.
 */
export const WAVES_CONTAINER_HOSTS: readonly string[] = [
  WAVES_PRIMARY_HOST,
  WAVES_FALLBACK_HOST,
  'leothreads',
  'peak.snaps',
  'liketu.moments',
  'liketu.speak',
];

/**
 * True when `account` is one of the recognised waves container hosts. Use this
 * instead of comparing against a single hard-coded host so that waves served
 * from any unified container account are classified correctly.
 */
export const isWavesHost = (account?: string | null): boolean =>
  !!account && WAVES_CONTAINER_HOSTS.includes(account);
