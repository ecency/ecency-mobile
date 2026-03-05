/**
 * HiveAuth Broadcast Sheet
 *
 * Global sheet for handling HiveAuth broadcast operations.
 * Can be triggered from anywhere using SheetManager.show()
 *
 * Uses the SheetManager return-value pattern:
 * - SheetManager.show() returns a promise that resolves when the sheet hides
 * - SheetManager.hide(id, { payload }) passes the result back to the caller
 * - This ensures the caller receives the result AFTER the sheet (and its
 *   reanimated animations) is fully hidden, preventing crashes from query
 *   invalidation racing with animation worklets.
 *
 * Usage:
 * ```
 * import { SheetManager } from 'react-native-actions-sheet';
 * import { SheetNames } from '../navigation/sheets';
 *
 * const response = await SheetManager.show(SheetNames.HIVE_AUTH_BROADCAST, {
 *   payload: { operations: [['vote', { voter, author, permlink, weight }]] },
 * });
 *
 * if (response?.success) {
 *   console.log('Broadcast result:', response.result);
 * } else if (response) {
 *   console.error('Broadcast error:', response.error);
 * } else {
 *   console.log('User dismissed');
 * }
 * ```
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import { useHiveAuth, HiveAuthStatus } from '../hiveAuthModal/hooks/useHiveAuth';
import { ModalHeader } from '../modalHeader';
import { StatusContent } from '../hiveAuthModal/children/statusContent';
import { useAppSelector } from '../../hooks';
import { selectCurrentAccount } from '../../redux/selectors';
import RootNavigation from '../../navigation/rootNavigation';
import ROUTES from '../../constants/routeNames';
import styles from '../hiveAuthModal/styles/hiveAuthModal.styles';

// Delay in milliseconds to show success/error status before auto-closing
const AUTO_CLOSE_DELAY = 1500;

export const HiveAuthBroadcastSheet = ({ sheetId, payload }: SheetProps<'hive_auth_broadcast'>) => {
  const intl = useIntl();
  const hiveAuth = useHiveAuth();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const isCancelledRef = useRef(false);
  const broadcastStartedRef = useRef(false);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [broadcastSeq, setBroadcastSeq] = useState(0);

  // Keep refs to avoid stale closures in the broadcast effect
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const sheetIdRef = useRef(sheetId);
  const currentAccountUsernameRef = useRef(currentAccount?.name ?? currentAccount?.username);
  const hiveAuthBroadcastRef = useRef(hiveAuth.broadcast);

  sheetIdRef.current = sheetId;
  currentAccountUsernameRef.current = currentAccount?.name ?? currentAccount?.username;
  hiveAuthBroadcastRef.current = hiveAuth.broadcast;

  // Reset refs when new operations arrive
  useEffect(() => {
    isCancelledRef.current = false;
    broadcastStartedRef.current = false;
    setBroadcastSeq((seq) => seq + 1);
  }, [payload?.operations, payload]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, []);

  // Automatically start broadcast when sheet opens with operations
  useEffect(() => {
    if (isCancelledRef.current) return;

    const operations = payloadRef.current?.operations;

    if (!operations || operations.length === 0) {
      if (!isCancelledRef.current) {
        SheetManager.hide(sheetIdRef.current, {
          payload: { success: false, error: new Error('No operations provided') },
        });
      }
      return;
    }

    if (broadcastStartedRef.current) return;
    broadcastStartedRef.current = true;

    const executeBroadcast = async () => {
      try {
        const result = await hiveAuthBroadcastRef.current(operations);

        if (isCancelledRef.current) return;

        // Show success UI, then close with result after delay.
        // SheetManager.hide resolves the SheetManager.show() promise,
        // so the caller receives the result AFTER animations complete.
        autoCloseTimerRef.current = setTimeout(() => {
          if (!isCancelledRef.current) {
            SheetManager.hide(sheetIdRef.current, {
              payload: { success: true, result },
            });
          }
        }, AUTO_CLOSE_DELAY);
      } catch (error) {
        if (isCancelledRef.current) return;

        console.error('[HiveAuthBroadcastSheet] Broadcast failed', error);

        const errorMessage = String((error as Error)?.message || '').toLowerCase();
        const isAuthExpired =
          errorMessage.includes('auth_expired') || errorMessage.includes('auth expired');

        if (isAuthExpired) {
          console.log('[HiveAuthBroadcastSheet] Auth expired, navigating to login');
          // Close immediately for auth expiry, then navigate
          SheetManager.hide(sheetIdRef.current, {
            payload: { success: false, error: error as Error },
          });
          setTimeout(() => {
            RootNavigation.navigate({
              name: ROUTES.SCREENS.LOGIN,
              params: { username: currentAccountUsernameRef.current },
            });
          }, 300);
        } else {
          // Show error UI, then close with error after delay
          autoCloseTimerRef.current = setTimeout(() => {
            if (!isCancelledRef.current) {
              SheetManager.hide(sheetIdRef.current, {
                payload: { success: false, error: error as Error },
              });
            }
          }, AUTO_CLOSE_DELAY);
        }
      }
    };

    executeBroadcast();
  }, [payload?.operations, broadcastSeq]);

  const handleClose = () => {
    isCancelledRef.current = true;
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    // Hide without payload — undefined return tells caller the user dismissed
    SheetManager.hide(sheetId);
  };

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={false}
      closeOnTouchBackdrop={false}
      onClose={() => {
        hiveAuth.reset();
      }}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.container}>
        <ModalHeader
          modalHeaderContainerStyle={styles.modalHeader}
          title={intl.formatMessage({ id: 'hiveauth.title' })}
          isCloseButton={true}
          onClosePress={handleClose}
        />

        <View style={styles.content}>
          {hiveAuth.status === HiveAuthStatus.INPUT ? (
            <View>
              <Text>{intl.formatMessage({ id: 'hiveauth.initiating' })}</Text>
            </View>
          ) : (
            <StatusContent status={hiveAuth.status} statusText={hiveAuth.statusText} />
          )}
        </View>
      </View>
    </ActionSheet>
  );
};
