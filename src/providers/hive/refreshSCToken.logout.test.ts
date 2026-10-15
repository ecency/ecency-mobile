// The logout race end to end: the real refreshSCToken and the real storage functions
// (on the AsyncStorage mock from jest.setup), with a logout landing mid-refresh.
import AsyncStorage from '@react-native-async-storage/async-storage';

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
// eslint-disable-next-line import/first
import { removeAllUserData } from '../../storage/storage';

const USER = { username: 'alice', accessToken: 'enc-old' };
const RENEWED = {
  username: 'alice',
  access_token: 'new-token',
  refresh_token: 'new-refresh',
  expires_in: 604800,
};

const stored = async (key: string) => JSON.parse((await AsyncStorage.getItem(key)) || '[]');

describe('refreshSCToken and logout', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('user', JSON.stringify([USER]));
    await AsyncStorage.setItem(
      'sc_accounts',
      JSON.stringify([
        {
          username: 'alice',
          refreshToken: 'old-refresh',
          expireDate: new Date(Date.now() + 86400000).toString(),
        },
      ]),
    );
  });

  it('leaves nothing behind when logout lands during the first account read', async () => {
    mockRenew.mockResolvedValue(RENEWED);
    const realGetItem = AsyncStorage.getItem;
    let held = false;
    let readStarted!: () => void;
    const started = new Promise<void>((r) => {
      readStarted = r;
    });
    // hold refreshSCToken's own read of the stored account open (replaced, not spied:
    // the jest.setup mock is a jest.fn, and restoring a spy on it wipes its behaviour)
    // The value is read first and handed back later, as a slow storage read would: the
    // account is still there when read, and the logout runs before the caller sees it.
    AsyncStorage.getItem = (async (k: string) => {
      const value = await realGetItem(k);
      if (!held) {
        held = true;
        readStarted();
        await new Promise((r) => setTimeout(r, 10));
      }
      return value;
    }) as typeof AsyncStorage.getItem;
    const refreshing = refreshSCToken(USER, '1234');
    await started;
    const loggingOut = removeAllUserData();
    await Promise.all([refreshing, loggingOut]);
    AsyncStorage.getItem = realGetItem;
    expect(await stored('sc_accounts')).toEqual([]);
    expect(await stored('user')).toEqual([]);
  });

  it('leaves nothing behind when logout lands while the renewal is on the network', async () => {
    let answer!: (value: any) => void;
    mockRenew.mockReturnValue(
      new Promise((r) => {
        answer = r;
      }),
    );
    const refreshing = refreshSCToken(USER, '1234');
    await new Promise((r) => setTimeout(r, 0));
    const loggingOut = removeAllUserData();
    answer(RENEWED);
    await Promise.all([refreshing, loggingOut]);
    expect(await stored('sc_accounts')).toEqual([]);
    expect(await stored('user')).toEqual([]);
  });

  it('leaves nothing behind when logout lands while the token is being written', async () => {
    mockRenew.mockResolvedValue(RENEWED);
    const realSetItem = AsyncStorage.setItem;
    let held = false;
    let writeStarted!: () => void;
    const started = new Promise<void>((r) => {
      writeStarted = r;
    });
    // hold the first credential write open, so the logout overlaps it
    AsyncStorage.setItem = (async (k: string, v: string) => {
      if (!held) {
        held = true;
        writeStarted();
        await new Promise((r) => setTimeout(r, 10));
      }
      return realSetItem(k, v);
    }) as typeof AsyncStorage.setItem;
    const refreshing = refreshSCToken(USER, '1234');
    await started;
    const loggingOut = removeAllUserData();
    await Promise.all([refreshing, loggingOut]);
    AsyncStorage.setItem = realSetItem;
    expect(await stored('sc_accounts')).toEqual([]);
    expect(await stored('user')).toEqual([]);
  });
});
