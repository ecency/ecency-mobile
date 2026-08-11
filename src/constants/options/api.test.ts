import { BLOCKED_SERVERS, SERVER_LIST, isBlockedServer, withoutBlockedServers } from './api';

describe('blocked servers', () => {
  it('does not ship a denied node in the fallback list', () => {
    expect(withoutBlockedServers([...SERVER_LIST])).toEqual([...SERVER_LIST]);
  });

  it('flags denied nodes', () => {
    BLOCKED_SERVERS.forEach((server) => {
      expect(isBlockedServer(server)).toBe(true);
    });
  });

  it('ignores case and a trailing slash', () => {
    expect(isBlockedServer('https://TechCoderX.com/')).toBe(true);
    expect(isBlockedServer('  https://techcoderx.com  ')).toBe(true);
  });

  it('allows nodes that are not denied', () => {
    expect(isBlockedServer('https://api.hive.blog')).toBe(false);
    expect(isBlockedServer(undefined)).toBe(false);
    expect(isBlockedServer(null)).toBe(false);
  });

  it('drops denied nodes from a pool while preserving order', () => {
    expect(
      withoutBlockedServers([
        'https://api.hive.blog',
        'https://techcoderx.com',
        'https://api.deathwing.me',
        'https://hiveapi.actifit.io',
      ]),
    ).toEqual(['https://api.hive.blog', 'https://api.deathwing.me']);
  });
});
