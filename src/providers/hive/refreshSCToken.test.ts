const mockStorage = {
  getSCAccount: jest.fn(),
  setSCAccount: jest.fn(),
  updateUserData: jest.fn(),
};
jest.mock('../../storage/storage', () => ({
  setUserData: jest.fn(),
  setAuthStatus: jest.fn(),
  updateUserData: (...args: any[]) => mockStorage.updateUserData(...args),
  updateCurrentUsername: jest.fn(),
  getUserData: jest.fn(),
  getUserDataWithUsername: jest.fn(),
  setSCAccount: (...args: any[]) => mockStorage.setSCAccount(...args),
  getSCAccount: (...args: any[]) => mockStorage.getSCAccount(...args),
  setPinCode: jest.fn(),
}));
const mockRenew = jest.fn();
jest.mock('@ecency/sdk', () => ({
  PrivateKey: { fromString: jest.fn() },
  hsTokenRenew: (...args: any[]) => mockRenew(...args),
}));
jest.mock('../../utils/crypto', () => ({
  encryptKey: (value: string, pin: string) => `enc(${value},${pin})`,
  decryptKey: jest.fn(),
}));
jest.mock('../queries', () => ({ fetchUnreadActivityCount: jest.fn(), getQueryClient: jest.fn() }));
jest.mock('../ecency/ePoint', () => ({ getPointsSummary: jest.fn() }));
jest.mock('./hivesignerAPI', () => ({}));
jest.mock('./hive', () => ({ getDigitPinCode: jest.fn() }));
jest.mock('../../utils/editor', () => ({ delay: jest.fn() }));
jest.mock('../../utils/hive-signer-helper', () => ({ makeHsCode: jest.fn() }));
jest.mock('../../utils/user', () => ({ getAvatar: jest.fn(), getName: jest.fn() }));

// eslint-disable-next-line import/first
import { refreshSCToken } from './auth';

const USER = { username: 'alice', accessToken: 'enc-old' };
const RENEWED = { access_token: 'new-token', refresh_token: 'new-refresh', expires_in: 604800 };

describe('refreshSCToken', () => {
  beforeEach(() => {
    Object.values(mockStorage).forEach((fn) => fn.mockReset());
    mockRenew.mockReset();
    mockStorage.getSCAccount.mockResolvedValue({
      refreshToken: 'old-refresh',
      expireDate: new Date(Date.now() + 86400000).toISOString(),
    });
    mockRenew.mockResolvedValue(RENEWED);
  });

  it('stores and returns the renewed token', async () => {
    await expect(refreshSCToken(USER, '1234')).resolves.toBe('enc(new-token,1234)');
    expect(mockStorage.setSCAccount).toHaveBeenCalledWith(RENEWED);
    expect(mockStorage.updateUserData).toHaveBeenCalledWith({
      ...USER,
      accessToken: 'enc(new-token,1234)',
    });
  });

  it('writes nothing when the reader is no longer current by the time it answers', async () => {
    let current = true;
    mockRenew.mockImplementation(async () => {
      current = false; // logged out while the request was in flight
      return RENEWED;
    });
    await expect(refreshSCToken(USER, '1234', { isCurrent: () => current })).resolves.toBeNull();
    expect(mockStorage.setSCAccount).not.toHaveBeenCalled();
    expect(mockStorage.updateUserData).not.toHaveBeenCalled();
  });

  it('stores as before when the reader is still current', async () => {
    await expect(refreshSCToken(USER, '1234', { isCurrent: () => true })).resolves.toBe(
      'enc(new-token,1234)',
    );
    expect(mockStorage.setSCAccount).toHaveBeenCalled();
  });
});
