import { isOnlineState } from './onlineState';

describe('isOnlineState', () => {
  it('reports online for a normal connected state', () => {
    expect(isOnlineState({ isConnected: true, isInternetReachable: true })).toBe(true);
  });

  it('reports offline only when connectivity is explicitly false', () => {
    expect(isOnlineState({ isConnected: false, isInternetReachable: null })).toBe(false);
  });

  it('reports offline when reachability is explicitly false', () => {
    expect(isOnlineState({ isConnected: true, isInternetReachable: false })).toBe(false);
  });

  it('treats an unknown connectivity state as online, not offline', () => {
    // NetInfo reports isConnected as null until the platform has determined a
    // state, which is what the first event after launch carries. Reading that as
    // offline parks every mutation until some later connectivity event arrives.
    expect(isOnlineState({ isConnected: null, isInternetReachable: null })).toBe(true);
  });

  it('treats a pending reachability probe as online', () => {
    expect(isOnlineState({ isConnected: true, isInternetReachable: null })).toBe(true);
  });
});
