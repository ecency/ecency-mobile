import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Operation } from '@hiveio/dhive';
import * as hiveuri from 'hive-uri';
import { useAppSelector } from '.';
import { selectCurrentAccount } from '../redux/selectors';
import AUTH_TYPE from '../constants/authType';
import ROUTES from '../constants/routeNames';

export interface ActiveKeyOperationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface ActiveKeyOperationOptions {
  /** Operations array to broadcast */
  operations: Operation[];
  /** Handler function for private key signing (when user has local keys) */
  privateKeyHandler?: () => Promise<any>;
  /** Callbacks for operation lifecycle */
  callbacks?: ActiveKeyOperationCallbacks;
}

/**
 * Unified hook for handling active key operations across different auth types.
 * Automatically routes to appropriate signing method:
 * - HiveSigner: Opens WebView for hot signing
 * - HiveAuth: Opens HiveAuth/Keychain app
 * - Private Keys: Executes provided handler function
 *
 * @example
 * ```typescript
 * const { executeOperation } = useActiveKeyOperation();
 *
 * const handleBoost = async () => {
 *   const operations = buildBoostOpArr(username, point, author, permlink);
 *
 *   await executeOperation({
 *     operations,
 *     privateKeyHandler: () => boost(currentAccount, pinCode, point, permlink, author),
 *     callbacks: {
 *       onSuccess: () => navigation.goBack(),
 *       onError: (error) => showError(error.message)
 *     }
 *   });
 * };
 * ```
 */
export const useActiveKeyOperation = () => {
  const navigation = useNavigation();
  const currentAccount = useAppSelector(selectCurrentAccount);

  const authType = currentAccount?.local?.authType;

  /**
   * Determines if the current auth type requires modal navigation
   * (HiveSigner or HiveAuth)
   */
  const requiresModal = authType === AUTH_TYPE.STEEM_CONNECT || authType === AUTH_TYPE.HIVE_AUTH;

  /**
   * Executes an active key operation using the appropriate signing method
   * based on the user's authentication type
   */
  const executeOperation = useCallback(
    async ({
      operations,
      privateKeyHandler,
      callbacks,
    }: ActiveKeyOperationOptions): Promise<void> => {
      // Validate inputs
      if (!operations || operations.length === 0) {
        const error = new Error('Operations array is required');
        callbacks?.onError?.(error);
        throw error;
      }

      if (!authType) {
        const error = new Error('User not authenticated');
        callbacks?.onError?.(error);
        throw error;
      }

      // Route based on auth type
      if (authType === AUTH_TYPE.STEEM_CONNECT || authType === AUTH_TYPE.HIVE_AUTH) {
        // For HiveSigner and HiveAuth, navigate to signing modal
        return new Promise((resolve, reject) => {
          try {
            // Encode operation for HiveSigner hot signing
            const encodedUri = hiveuri.encodeOp(operations[0]);

            navigation.navigate(ROUTES.MODALS.HIVE_SIGNER, {
              hiveuri: encodedUri,
              opsArray: operations,
              onSuccess: () => {
                callbacks?.onSuccess?.();
                resolve();
              },
              onClose: () => {
                const error = new Error('Operation cancelled by user');
                callbacks?.onClose?.();
                callbacks?.onError?.(error);
                reject(error);
              },
            });
          } catch (error) {
            callbacks?.onError?.(error as Error);
            reject(error);
          }
        });
      } else {
        // For private key auth types, use the provided handler
        if (!privateKeyHandler) {
          const error = new Error(
            'Private key handler is required for local key signing. ' +
              'Please provide a privateKeyHandler function or ensure active key is available.',
          );
          callbacks?.onError?.(error);
          throw error;
        }

        try {
          await privateKeyHandler();
          callbacks?.onSuccess?.();
        } catch (error) {
          callbacks?.onError?.(error as Error);
          throw error;
        }
      }
    },
    [authType, currentAccount, navigation],
  );

  return {
    /** Execute an active key operation */
    executeOperation,
    /** Whether current auth type requires modal (HiveSigner/HiveAuth) */
    requiresModal,
    /** Current authentication type */
    authType,
    /** Current account */
    currentAccount,
  };
};
