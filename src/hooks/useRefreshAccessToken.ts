import { useCallback } from 'react';
import Config from 'react-native-config';
import { useAppDispatch, useAppSelector, useAppStore } from './index';
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
 * has nothing to refresh, e.g. a key login), or undefined when the reader logged out or
 * switched accounts while it ran; throws when the token has expired and cannot be renewed.
 */
export const useRefreshAccessToken = () => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  return useCallback(async (): Promise<string | undefined> => {
    if (!currentAccount?.local) return undefined;
    // HiveAuth and other default-pin accounts are encrypted with the default pin (useAuth).
    const pin = (pinHash ? getDigitPinCode(pinHash) : undefined) || Config.DEFAULT_PIN;
    // Still this reader? Asked by refreshSCToken after the network call and before it
    // stores anything, so a logout during the request never gets credentials written
    // back to disk; and again here, before redux is touched.
    const isCurrent = () => {
      const now = selectCurrentAccount(store.getState());
      return !!now?.local && now.name === currentAccount.name;
    };
    const encrypted = await refreshSCToken(currentAccount.local, pin, { isCurrent });
    if (!encrypted || !isCurrent()) {
      // Logged out or switched accounts meanwhile: this token is not theirs.
      return undefined;
    }

    // The request took a while: act on the account as it is now, not as it was.
    const latest = selectCurrentAccount(store.getState());
    if (latest.local.accessToken === currentAccount.local.accessToken) {
      if (encrypted !== latest.local.accessToken) {
        dispatch(
          updateCurrentAccount({ ...latest, local: { ...latest.local, accessToken: encrypted } }),
        );
      }
    }
    // Otherwise another refresh (e.g. the app resuming) stored a newer token already;
    // the one renewed here is still valid to use.
    return decryptKey(encrypted, pin) || undefined;
  }, [currentAccount, pinHash, dispatch, store]);
};
