import { QueryClient } from '@tanstack/react-query';
import { getAccountFullQueryOptions } from '@ecency/sdk';
import type { PlatformAdapter } from '@ecency/sdk';
import type { Operation, TransactionConfirmation } from '@hiveio/dhive';
import * as hiveuri from 'hive-uri';
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
import RootNavigation from '../../navigation/rootNavigation';
import ROUTES from '../../constants/routeNames';

// --- Temp active key storage (mirrors website's auth-upgrade-events.ts pattern) ---
let _tempActiveKey: string | null = null;
let _tempActiveKeyTimer: ReturnType<typeof setTimeout> | null = null;

export const setTempActiveKey = (key: string) => {
  _tempActiveKey = key;
  if (_tempActiveKeyTimer) {
    clearTimeout(_tempActiveKeyTimer);
  }
  _tempActiveKeyTimer = setTimeout(() => {
    _tempActiveKey = null;
    _tempActiveKeyTimer = null;
  }, 60_000);
};

export const getTempActiveKey = (): string | null => _tempActiveKey;

export const clearTempActiveKey = () => {
  _tempActiveKey = null;
  if (_tempActiveKeyTimer) {
    clearTimeout(_tempActiveKeyTimer);
    _tempActiveKeyTimer = null;
  }
};

// Lazy-loaded sheet deps to avoid circular imports
let _cachedSheetManager: typeof import('react-native-actions-sheet').SheetManager | null = null;
let _cachedSheetNames: typeof import('../../navigation/sheets').SheetNames | null = null;
let _pendingAuthUpgradePromise: Promise<'hiveauth' | 'hivesigner' | 'key' | false> | null = null;

// When the auth upgrade sheet returns 'hivesigner', the SDK cannot handle hot signing
// (it only does token-based HiveSigner which lacks active scope). We return 'hiveauth'
// to the SDK so it calls broadcastWithHiveAuth() — which gives us the operations array.
// This flag tells broadcastWithHiveAuth to redirect to the HiveSigner WebView instead.
let _authUpgradeUseHiveSigner = false;

const getSheetDeps = async () => {
  if (!_cachedSheetManager || !_cachedSheetNames) {
    const [actionSheetModule, sheetsModule] = await Promise.all([
      import('react-native-actions-sheet'),
      import('../../navigation/sheets'),
    ]);
    _cachedSheetManager = actionSheetModule.SheetManager;
    _cachedSheetNames = sheetsModule.SheetNames;
  }
  return { SheetManager: _cachedSheetManager!, SheetNames: _cachedSheetNames! };
};

interface MobilePlatformAdapterParams {
  queryClient: QueryClient;
  userActivityMutate?: (params: {
    pointsTy: number;
    transactionId: string;
    blockNum?: number;
  }) => void;
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
      // Check temp key first (set by AuthUpgradeSheet key input)
      const tempKey = getTempActiveKey();
      if (tempKey) {
        clearTempActiveKey();
        return tempKey;
      }

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

      // HiveSigner access tokens only have posting scope.
      // For active operations, return null so the SDK goes directly to
      // showAuthUpgradeUI instead of attempting a doomed token-based broadcast.
      if (mapped === 'hivesigner' && authority === 'active') {
        return null;
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
      // Auth upgrade selected HiveSigner: redirect to hot signing WebView.
      // The SDK doesn't call broadcastWithHiveSigner directly, so we route
      // through broadcastWithHiveAuth by returning 'hiveauth' from showAuthUpgradeUI.
      if (_authUpgradeUseHiveSigner) {
        _authUpgradeUseHiveSigner = false;
        const encodedUri = hiveuri.encodeOps(ops);
        return new Promise<TransactionConfirmation>((resolve, reject) => {
          RootNavigation.navigate({
            name: ROUTES.MODALS.HIVE_SIGNER,
            params: {
              hiveuri: encodedUri,
              opsArray: ops,
              onSuccess: () => resolve({} as TransactionConfirmation),
              onClose: () => reject(new Error('HiveSigner signing cancelled')),
            },
          });
        });
      }

      const state = store.getState();
      const currentAccount = state.account?.currentAccount;
      const opName = ops.length > 0 ? (ops[0][0] as string) : 'unknown';
      return handleHiveAuthFallback(currentAccount, ops, opName);
    },

    broadcastWithHiveSigner: async (
      _username: string,
      ops: Operation[],
      _keyType: 'posting' | 'active' | 'owner' | 'memo',
    ): Promise<TransactionConfirmation> => {
      // Encode operations as hive-uri for HiveSigner hot signing WebView
      const encodedUri = hiveuri.encodeOps(ops);

      return new Promise<TransactionConfirmation>((resolve, reject) => {
        RootNavigation.navigate({
          name: ROUTES.MODALS.HIVE_SIGNER,
          params: {
            hiveuri: encodedUri,
            opsArray: ops,
            onSuccess: () => {
              // HiveSigner WebView confirms via URL redirect, no tx confirmation returned
              resolve({} as TransactionConfirmation);
            },
            onClose: () => {
              reject(new Error('HiveSigner signing cancelled'));
            },
          },
        });
      });
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
    ): Promise<'hiveauth' | 'hivesigner' | 'key' | false> => {
      if (_pendingAuthUpgradePromise) {
        return _pendingAuthUpgradePromise;
      }

      const state = store.getState();
      const currentAccount = state.account?.currentAccount;
      const username = currentAccount?.name || currentAccount?.username || '';

      _pendingAuthUpgradePromise = (async () => {
        try {
          // HiveSigner users: skip the dialog and go directly to hot signing.
          // getLoginType returns null for hivesigner+active, so the SDK calls
          // showAuthUpgradeUI. We auto-select HiveSigner to preserve the existing
          // UX where the WebView opens immediately for HiveSigner-logged users.
          const local = _getAccountLocal(username);
          const loginType = local?.authType ? mapAuthTypeToLoginType(local.authType) : null;
          if (loginType === 'hivesigner') {
            _authUpgradeUseHiveSigner = true;
            return 'hiveauth';
          }

          const { SheetManager, SheetNames } = await getSheetDeps();

          // SheetManager.show() returns a promise that resolves with the value
          // passed to SheetManager.hide(id, { payload: value }) when the sheet closes.
          // This avoids callback-based races where onClose fires from a previous
          // close animation and resolves the wrong promise.
          const result = await SheetManager.show(SheetNames.AUTH_UPGRADE, {
            payload: { requiredAuthority, operation, username },
          });
          // result is undefined when user dismisses via backdrop tap
          if (!result) return false;

          if (result === 'hivesigner') {
            // SDK's H('hivesigner') uses token-based API which lacks active scope.
            // Set flag so broadcastWithHiveAuth redirects to hot signing WebView,
            // then return 'hiveauth' so the SDK calls broadcastWithHiveAuth with the ops.
            _authUpgradeUseHiveSigner = true;
            return 'hiveauth';
          }

          return result;
        } catch (sheetError: any) {
          console.error('[showAuthUpgradeUI] Failed to show sheet:', sheetError);
          return false;
        }
      })();

      try {
        return await _pendingAuthUpgradePromise;
      } finally {
        _pendingAuthUpgradePromise = null;
      }
    },
  };
}
