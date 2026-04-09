import { useMemo } from 'react';
import Config from 'react-native-config';
import { useAppSelector } from './index';
import { selectCurrentAccount, selectPin } from '../redux/selectors';
import { decryptKey } from '../utils/crypto';
import { getDigitPinCode } from '../providers/hive/hive';

/**
 * Global memoized auth hook that returns username and access token
 * Caches crypto operations (AES-256 decryption) to avoid re-computing on every render
 * Only recomputes when account or pin changes
 *
 * PERFORMANCE: This hook is shared across all queries to prevent duplicate decryption operations.
 * Previously each query file had its own local useAuth, causing unnecessary AES-256 decryptions.
 *
 * @returns {Object} Auth credentials
 * @returns {string | undefined} username - Current account username
 * @returns {string | undefined} code - Decrypted access token
 */
export const useAuth = () => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  return useMemo(() => {
    const digitPinCode = pinHash ? getDigitPinCode(pinHash) : undefined;
    let accessToken: string | undefined;

    if (currentAccount?.local?.accessToken) {
      if (digitPinCode) {
        accessToken = decryptKey(currentAccount.local.accessToken, digitPinCode);
      }
      // HiveAuth accounts use default pin unless user changes it
      if (!accessToken) {
        accessToken = decryptKey(currentAccount.local.accessToken, Config.DEFAULT_PIN);
      }
    }

    return { username: currentAccount?.name, code: accessToken };
  }, [currentAccount?.name, currentAccount?.local?.accessToken, pinHash]);
};
