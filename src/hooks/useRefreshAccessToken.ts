import { useCallback } from 'react';
import Config from 'react-native-config';
import { useAppDispatch, useAppSelector } from './index';
import { selectCurrentAccount, selectPin } from '../redux/selectors';
import { updateCurrentAccount } from '../redux/actions/accountAction';
import { refreshSCToken } from '../providers/hive/auth';
import { getDigitPinCode } from '../providers/hive/hive';
import { decryptKey } from '../utils/crypto';

/**
 * Renews the current account's access token on demand, the way the app does on resume
 * (applicationContainer _refreshAccessToken): refreshSCToken stores the new token, and
 * the account in redux is updated so useAuth() hands it to everything else.
 *
 * For a screen that has been open long enough for its token to expire, before it gives
 * up on a request. Resolves to the decrypted token (the unchanged one when the account
 * has nothing to refresh, e.g. a key login); throws when the token has expired and
 * cannot be renewed.
 */
export const useRefreshAccessToken = () => {
  const dispatch = useAppDispatch();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  return useCallback(async (): Promise<string | undefined> => {
    if (!currentAccount?.local) return undefined;
    // HiveAuth and other default-pin accounts are encrypted with the default pin (useAuth).
    const pin = (pinHash ? getDigitPinCode(pinHash) : undefined) || Config.DEFAULT_PIN;
    const encrypted = await refreshSCToken(currentAccount.local, pin);
    if (encrypted && encrypted !== currentAccount.local.accessToken) {
      dispatch(
        updateCurrentAccount({
          ...currentAccount,
          local: { ...currentAccount.local, accessToken: encrypted },
        }),
      );
    }
    return (encrypted && decryptKey(encrypted, pin)) || undefined;
  }, [currentAccount, pinHash, dispatch]);
};
