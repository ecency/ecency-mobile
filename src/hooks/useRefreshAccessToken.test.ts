const mockDispatch = jest.fn();
const mockState: { account: any; pin: string | null } = { account: null, pin: 'pin-hash' };
// `latest` is the store at the moment the refresh returns; null means "same as account".
const mockLatest: { account: any } = { account: null };
jest.mock('./index', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(),
  useAppStore: () => ({ getState: () => ({ fromStore: true }) }),
}));
jest.mock('../redux/selectors', () => ({
  selectCurrentAccount: (state?: any) =>
    state?.fromStore && mockLatest.account !== null ? mockLatest.account : mockState.account,
  selectPin: () => mockState.pin,
}));
jest.mock('../redux/actions/accountAction', () => ({
  updateCurrentAccount: (data: any) => ({ type: 'UPDATE_CURRENT_ACCOUNT', payload: data }),
}));
const mockRefreshSCToken = jest.fn();
jest.mock('../providers/hive/auth', () => ({
  refreshSCToken: (...args: any[]) => mockRefreshSCToken(...args),
}));
jest.mock('../providers/hive/hive', () => ({ getDigitPinCode: () => '1234' }));
jest.mock('../utils/crypto', () => ({
  decryptKey: (value: string, pin: string) => `plain(${value},${pin})`,
}));
jest.mock('react-native-config', () => ({ DEFAULT_PIN: 'default' }));
jest.mock('react', () => ({ ...jest.requireActual('react'), useCallback: (fn: any) => fn }));

// eslint-disable-next-line import/first
import { useRefreshAccessToken } from './useRefreshAccessToken';

describe('useRefreshAccessToken', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockRefreshSCToken.mockReset();
    mockState.account = { name: 'alice', local: { username: 'alice', accessToken: 'enc-old' } };
    mockState.pin = 'pin-hash';
    mockLatest.account = null;
  });

  it('stores a renewed token in the current account and returns it decrypted', async () => {
    mockRefreshSCToken.mockResolvedValue('enc-new');
    await expect(useRefreshAccessToken()()).resolves.toBe('plain(enc-new,1234)');
    expect(mockRefreshSCToken).toHaveBeenCalledWith(mockState.account.local, '1234', {
      isCurrent: expect.any(Function),
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CURRENT_ACCOUNT',
      payload: { name: 'alice', local: { username: 'alice', accessToken: 'enc-new' } },
    });
  });

  it('changes nothing when there was nothing to renew', async () => {
    mockRefreshSCToken.mockResolvedValue('enc-old');
    await expect(useRefreshAccessToken()()).resolves.toBe('plain(enc-old,1234)');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('uses the default pin for accounts without one', async () => {
    mockState.pin = null;
    mockRefreshSCToken.mockResolvedValue('enc-new');
    await useRefreshAccessToken()();
    expect(mockRefreshSCToken).toHaveBeenCalledWith(mockState.account.local, 'default', {
      isCurrent: expect.any(Function),
    });
  });

  it('reports a token that expired and cannot be renewed', async () => {
    mockRefreshSCToken.mockRejectedValue(new Error('expired'));
    await expect(useRefreshAccessToken()()).rejects.toThrow('expired');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('leaves the account alone when the reader switched accounts meanwhile', async () => {
    mockRefreshSCToken.mockImplementation(async () => {
      mockLatest.account = { name: 'bob', local: { username: 'bob', accessToken: 'enc-bob' } };
      return 'enc-new';
    });
    await expect(useRefreshAccessToken()()).resolves.toBeUndefined();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('tells the storage step who is current, so a logout mid-request writes nothing', async () => {
    let askedAfterLogout: boolean | undefined;
    mockRefreshSCToken.mockImplementation(async (_local, _pin, { isCurrent }) => {
      mockLatest.account = undefined; // logged out while the request was in flight
      askedAfterLogout = isCurrent();
      return askedAfterLogout ? 'enc-new' : null; // refreshSCToken stores nothing then
    });
    await expect(useRefreshAccessToken()()).resolves.toBeUndefined();
    expect(askedAfterLogout).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('leaves the account alone when the reader logged out meanwhile', async () => {
    mockRefreshSCToken.mockImplementation(async () => {
      mockLatest.account = undefined;
      return 'enc-new';
    });
    await expect(useRefreshAccessToken()()).resolves.toBeUndefined();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('keeps a newer token that another refresh stored meanwhile', async () => {
    mockRefreshSCToken.mockImplementation(async () => {
      mockLatest.account = {
        name: 'alice',
        unread_activity_count: 3,
        local: { username: 'alice', accessToken: 'enc-resume' },
      };
      return 'enc-new';
    });
    // the token renewed here is still valid to use
    await expect(useRefreshAccessToken()()).resolves.toBe('plain(enc-new,1234)');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('updates the account as it is now, not as it was', async () => {
    mockRefreshSCToken.mockImplementation(async () => {
      mockLatest.account = {
        name: 'alice',
        unread_activity_count: 3,
        local: { username: 'alice', accessToken: 'enc-old' },
      };
      return 'enc-new';
    });
    await useRefreshAccessToken()();
    expect(mockDispatch.mock.calls[0][0].payload).toEqual({
      name: 'alice',
      unread_activity_count: 3,
      local: { username: 'alice', accessToken: 'enc-new' },
    });
  });

  it('does nothing when logged out', async () => {
    mockState.account = null;
    await expect(useRefreshAccessToken()()).resolves.toBeUndefined();
    expect(mockRefreshSCToken).not.toHaveBeenCalled();
  });
});
