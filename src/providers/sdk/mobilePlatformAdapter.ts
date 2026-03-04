import { Alert } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { getAccountFullQueryOptions } from '@ecency/sdk';
import type { PlatformAdapter } from '@ecency/sdk';
import type { Operation, TransactionConfirmation } from '@hiveio/dhive';
import { store } from '../../redux/store/store';
import { toastNotification } from '../../redux/actions/uiAction';
import {
  getDigitPinCode,
  getPostingKey,
  getActiveKey,
  handleHiveAuthFallback,
} from '../hive/dhive';
import { decryptKey } from '../../utils/crypto';
import { mapAuthTypeToLoginType } from '../../utils/authMapper';
import AUTH_TYPE from '../../constants/authType';

interface MobilePlatformAdapterParams {
  queryClient: QueryClient;
  userActivityMutate?: (params: { pointsTy: number; transactionId: string }) => void;
}

export function createMobilePlatformAdapter(params: MobilePlatformAdapterParams): PlatformAdapter {
  const { queryClient, userActivityMutate } = params;

  const _getAccountLocal = (username: string) => {
    const state = store.getState();
    const currentAccount = state.account?.currentAccount;
    if (currentAccount?.name === username || currentAccount?.username === username) {
      return currentAccount?.local;
    }
    return undefined;
  };

  const _getDigitPin = (): string | undefined => {
    const state = store.getState();
    const pin = state.application?.pin;
    if (!pin) return undefined;
    return getDigitPinCode(pin);
  };

  return {
    getUser: async (username: string) => {
      return queryClient.getQueryData(getAccountFullQueryOptions(username).queryKey);
    },

    getPostingKey: async (username: string) => {
      const local = _getAccountLocal(username);
      if (!local) return undefined;
      const digitPin = _getDigitPin();
      if (!digitPin) return undefined;
      return getPostingKey(local, digitPin) || undefined;
    },

    getActiveKey: async (username: string) => {
      const local = _getAccountLocal(username);
      if (!local) return undefined;
      const digitPin = _getDigitPin();
      if (!digitPin) return undefined;
      return getActiveKey(local, digitPin) || undefined;
    },

    getAccessToken: async (username: string) => {
      const local = _getAccountLocal(username);
      if (!local?.accessToken) return undefined;
      const digitPin = _getDigitPin();
      if (!digitPin) return undefined;
      return decryptKey(local.accessToken, digitPin) || undefined;
    },

    getLoginType: async (username: string, authority?: string) => {
      const local = _getAccountLocal(username);
      if (!local?.authType) return null;

      const mapped = mapAuthTypeToLoginType(local.authType);

      if (mapped === 'key') {
        // Active-key user doing an active operation → sign directly with active key
        if (authority === 'active' && local.activeKey) {
          return 'key';
        }

        // Key-based user without posting key but with access token →
        // use HiveSigner for posting operations (active-key-only users)
        if (!local.postingKey && local.accessToken) {
          return 'hivesigner';
        }
      }

      return mapped;
    },

    hasPostingAuthorization: async (username: string) => {
      const local = _getAccountLocal(username);
      if (!local?.authType) return false;

      const loginType = mapAuthTypeToLoginType(local.authType);

      // For key-based users, direct key signing is preferred over HiveSigner.
      // No need for the SDK's token-first optimization on mobile.
      if (loginType !== 'hiveauth') return false;

      // For HiveAuth users, check if they have granted ecency.app posting authority.
      // If yes, the SDK will try HiveSigner (access token) first, which avoids
      // the Keychain interaction entirely — faster and prevents background crashes.
      try {
        const accountData: any = queryClient.getQueryData(
          getAccountFullQueryOptions(username).queryKey,
        );
        if (!accountData?.posting?.account_auths) return false;
        return accountData.posting.account_auths.some((auth: any) => auth[0] === 'ecency.app');
      } catch {
        return false;
      }
    },

    broadcastWithHiveAuth: async (
      username: string,
      ops: Operation[],
      _keyType: 'posting' | 'active' | 'owner' | 'memo',
    ): Promise<TransactionConfirmation> => {
      const state = store.getState();
      const currentAccount = state.account?.currentAccount;

      // Reject immediately for non-HiveAuth users to prevent opening the
      // HiveAuth broadcast sheet (which initializes HAS WebSocket and crashes
      // when it detects the user isn't a HiveAuth user and tries to close immediately)
      if (currentAccount?.local?.authType !== AUTH_TYPE.HIVE_AUTH) {
        throw new Error('HiveAuth is not available. You are not logged in with HiveAuth.');
      }

      const opName = ops.length > 0 ? (ops[0][0] as string) : 'unknown';
      return handleHiveAuthFallback(currentAccount, ops, opName);
    },

    showError: (message: string) => {
      store.dispatch(toastNotification(message) as any);
    },

    showSuccess: (message: string) => {
      store.dispatch(toastNotification(message) as any);
    },

    recordActivity: async (activityType: number, txId: string, blockNum?: number) => {
      if (userActivityMutate) {
        userActivityMutate({ pointsTy: activityType, transactionId: txId, blockNum });
      }
    },

    invalidateQueries: async (keys: any[]) => {
      // Wrap entirely in try-catch: cache invalidation must never cause
      // mutateAsync to reject after a successful broadcast.
      try {
        await Promise.all(
          keys.map((key) => {
            // SDK may pass QueryFilters objects (e.g. { queryKey, exact, predicate })
            if (key && typeof key === 'object' && !Array.isArray(key)) {
              return queryClient.invalidateQueries(key);
            }
            return queryClient.invalidateQueries({ queryKey: key });
          }),
        );
      } catch (error) {
        console.warn('[mobilePlatformAdapter] invalidateQueries failed:', error);
      }
    },

    showAuthUpgradeUI: async (
      requiredAuthority: 'posting' | 'active',
      operation: string,
    ): Promise<'hiveauth' | 'hivesigner' | 'keychain' | 'key' | false> => {
      const state = store.getState();
      const currentAccount = state.account?.currentAccount;
      const local = currentAccount?.local;

      const isHiveAuth = local?.authType === AUTH_TYPE.HIVE_AUTH;
      const hasAccessToken = !!local?.accessToken;

      // If no upgrade methods available, tell user they need to re-login
      if (!isHiveAuth && !hasAccessToken) {
        return new Promise((resolve) => {
          Alert.alert(
            'Active Key Required',
            `The "${operation}" operation requires ${requiredAuthority} authority. ` +
              'Please log in with your active private key or master password.',
            [{ text: 'OK', style: 'cancel', onPress: () => resolve(false) }],
          );
        });
      }

      // Build options based on what the user can actually use
      return new Promise((resolve) => {
        type AlertButton = { text: string; onPress: () => void; style?: 'cancel' };
        const buttons: AlertButton[] = [];

        if (isHiveAuth) {
          buttons.push({ text: 'HiveAuth', onPress: () => resolve('hiveauth') });
        }
        if (hasAccessToken) {
          buttons.push({ text: 'HiveSigner', onPress: () => resolve('hivesigner') });
        }
        buttons.push({ text: 'Cancel', style: 'cancel', onPress: () => resolve(false) });

        Alert.alert(
          'Authorization Required',
          `The "${operation}" operation requires ` +
            `${requiredAuthority} authority. Choose an auth method:`,
          buttons,
        );
      });
    },
  };
}
