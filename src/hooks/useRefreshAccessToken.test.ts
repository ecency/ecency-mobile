const mockDispatch = jest.fn();
const mockState: { account: any; pin: string | null } = { account: null, pin: 'pin-hash' };
jest.mock('./index', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(),
}));
jest.mock('../redux/selectors', () => ({
  selectCurrentAccount: () => mockState.account,
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
  });

  it('stores a renewed token in the current account and returns it decrypted', async () => {
    mockRefreshSCToken.mockResolvedValue('enc-new');
    await expect(useRefreshAccessToken()()).resolves.toBe('plain(enc-new,1234)');
    expect(mockRefreshSCToken).toHaveBeenCalledWith(mockState.account.local, '1234');
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
    expect(mockRefreshSCToken).toHaveBeenCalledWith(mockState.account.local, 'default');
  });

  it('reports a token that expired and cannot be renewed', async () => {
    mockRefreshSCToken.mockRejectedValue(new Error('expired'));
    await expect(useRefreshAccessToken()()).rejects.toThrow('expired');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('does nothing when logged out', async () => {
    mockState.account = null;
    await expect(useRefreshAccessToken()()).resolves.toBeUndefined();
    expect(mockRefreshSCToken).not.toHaveBeenCalled();
  });
});
