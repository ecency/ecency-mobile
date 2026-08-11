const API_OPTIONS = [
  'api.hive.blog',
  'anyx.io',
  'api.openhive.network',
  'api.deathwing.me',
] as const;

export default API_OPTIONS;

export const VALUE = API_OPTIONS;

export const SERVER_LIST = [
  'https://api.deathwing.me',
  'https://rpc.mahdiyari.info',
  'https://api.openhive.network',
  'https://api.c0ff33a.uk',
  'https://api.hive.blog',
  'https://api.syncad.com',
] as const;

/**
 * Nodes that must never serve this app, whatever the remote node list or the
 * user's stored preference says.
 *
 * These answer `condenser_api.get_accounts` with `posting_json_metadata`
 * stripped to "" while balances and reputation are correct. That is a
 * well-formed result, so it passes shape validation and the health tracker
 * ranks it on latency alone. Wallet token visibility is read entirely from
 * `profile.tokens[].meta.show` in that metadata, so a stripped row reads as
 * "this user enabled nothing" and the wallet silently drops the user's
 * Hive-Engine and chain tokens back to HIVE/HP/HBD/Points.
 *
 * A denylist rather than just an omission: the saved-server preference is
 * prepended to the pool when it is not already in the fetched list, so simply
 * removing an entry would promote a stored bad node to *first* instead of
 * dropping it.
 */
export const BLOCKED_SERVERS: readonly string[] = [
  'https://techcoderx.com',
  'https://hiveapi.actifit.io',
];

const normalizeServer = (server: string) => server.trim().replace(/\/+$/, '').toLowerCase();

const BLOCKED_SERVER_SET = new Set(BLOCKED_SERVERS.map(normalizeServer));

/** True when a server must not be used (see BLOCKED_SERVERS). */
export const isBlockedServer = (server?: string | null): boolean =>
  typeof server === 'string' && BLOCKED_SERVER_SET.has(normalizeServer(server));

/** Drops any denied nodes from a pool, preserving order. */
export const withoutBlockedServers = (servers: readonly string[]): string[] =>
  servers.filter((server) => !isBlockedServer(server));
