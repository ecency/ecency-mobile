/**
 * HiveAuth Broadcast Sheet
 *
 * Global sheet for handling HiveAuth broadcast operations.
 * Can be triggered from anywhere using SheetManager.show()
 *
 * Usage:
 * ```
 * import { SheetManager } from 'react-native-actions-sheet';
 * import { SheetNames } from '../navigation/sheets';
 *
 * SheetManager.show(SheetNames.HIVE_AUTH_BROADCAST, {
 *   payload: {
 *     operations: [['vote', { voter, author, permlink, weight }]],
 *     onSuccess: (result) => console.log('Success'),
 *     onError: (error) => console.error('Error'),
 *   }
 * });
 * ```
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import { Operation } from '@hiveio/dhive';
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

interface HiveAuthBroadcastSheetPayload {
  operations: Operation[];
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onClose?: (error: Error) => void;
}

export const HiveAuthBroadcastSheet = ({
  sheetId,
  payload,
}: SheetProps<HiveAuthBroadcastSheetPayload>) => {
  const intl = useIntl();
  const hiveAuth = useHiveAuth();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const isCancelledRef = useRef(false);
  const broadcastStartedRef = useRef(false);
  const callbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [broadcastSeq, setBroadcastSeq] = useState(0);

  // Keep a ref to payload so the broadcast callback always reads the latest value
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  // Store stable refs for values needed in broadcast effect
  const sheetIdRef = useRef(sheetId);
  const currentAccountUsernameRef = useRef(currentAccount?.name ?? currentAccount?.username);
  const hiveAuthBroadcastRef = useRef(hiveAuth.broadcast);

  sheetIdRef.current = sheetId;
  currentAccountUsernameRef.current = currentAccount?.name ?? currentAccount?.username;
  hiveAuthBroadcastRef.current = hiveAuth.broadcast;

  // Reset refs when new operations arrive (not just when sheetId changes)
  // This ensures that if the sheet is reused with the same sheetId,
  // the refs are still reset for the new broadcast operation
  useEffect(() => {
    isCancelledRef.current = false;
    broadcastStartedRef.current = false;
    setBroadcastSeq((seq) => seq + 1);
  }, [payload?.operations, payload]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (callbackTimerRef.current) {
        clearTimeout(callbackTimerRef.current);
        callbackTimerRef.current = null;
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, []);

  // Automatically start broadcast when sheet opens with operations
  // This effect intentionally does NOT depend on handleBroadcast to prevent race conditions
  // caused by the callback being recreated on every render when dependencies change
  useEffect(() => {
    // Early exit if already cancelled (e.g., user clicked X button)
    if (isCancelledRef.current) {
      return;
    }

    const { operations, onSuccess, onError } = payloadRef.current || {};
    const clearTimers = () => {
      if (callbackTimerRef.current) {
        clearTimeout(callbackTimerRef.current);
        callbackTimerRef.current = null;
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };

    if (!operations || operations.length === 0) {
      // Signal failure to caller and close the sheet
      const error = new Error('No operations provided to HiveAuth broadcast sheet');
      // Double-check cancellation before calling callbacks (prevent race with handleClose)
      if (!isCancelledRef.current) {
        onError?.(error);
        ActionSheet.hide(sheetIdRef.current);
      }
      return;
    }

    // Guard against duplicate invocations (e.g. fast re-renders or multiple effect runs)
    if (broadcastStartedRef.current) {
      return;
    }
    broadcastStartedRef.current = true;

    const executeBroadcast = async () => {
      try {
        const result = await hiveAuthBroadcastRef.current(operations);

        if (!isCancelledRef.current) {
          // Defer onSuccess callback so the success UI (green checkmark with
          // reanimated ZoomIn animation) can render before the SDK starts
          // post-broadcast processing (cache invalidation, query refetches).
          // This prevents crashes from query observers triggering component tree
          // updates while the sheet's entering animation is still initializing.
          clearTimers();
          callbackTimerRef.current = setTimeout(() => {
            if (isCancelledRef.current) return;

            try {
              onSuccess?.(result);
            } catch (callbackError) {
              console.warn('[HiveAuthBroadcastSheet] onSuccess callback error', callbackError);
            }
          }, 300);

          // Auto-close after user has seen the success state
          autoCloseTimerRef.current = setTimeout(() => {
            if (!isCancelledRef.current) {
              ActionSheet.hide(sheetIdRef.current);
            }
          }, AUTO_CLOSE_DELAY);
        }
      } catch (error) {
        if (!isCancelledRef.current) {
          console.error('[HiveAuthBroadcastSheet] Broadcast failed', error);

          // Check if error is auth expiry - if so, navigate to login after hiding sheet
          const errorMessage = String((error as Error)?.message || '').toLowerCase();
          const isAuthExpired =
            errorMessage.includes('auth_expired') || errorMessage.includes('auth expired');

          if (isAuthExpired) {
            console.log('[HiveAuthBroadcastSheet] Auth expired, navigating to login');
            // Hide sheet first to avoid visual overlap (no delay for auth expiry)
            ActionSheet.hide(sheetIdRef.current);

            // Navigate to login screen after a small delay to let sheet close
            clearTimers();
            autoCloseTimerRef.current = setTimeout(() => {
              RootNavigation.navigate({
                name: ROUTES.SCREENS.LOGIN,
                params: { username: currentAccountUsernameRef.current },
              });
            }, 300);
          } else {
            // Wait for user to see the error message (red X) before closing
            clearTimers();
            autoCloseTimerRef.current = setTimeout(() => {
              if (!isCancelledRef.current) {
                ActionSheet.hide(sheetIdRef.current);
              }
            }, AUTO_CLOSE_DELAY);
          }

          // Call error callback after setting up the auto-close timer
          onError?.(error as Error);
        }
      }
    };

    executeBroadcast();
    // Only re-run when operations change (reference equality check)
    // We intentionally omit hiveAuthBroadcastRef, sheetIdRef, and other refs from dependencies
    // because they are kept up-to-date via ref assignments and don't need to trigger re-runs
  }, [payload?.operations, broadcastSeq]);

  const handleClose = () => {
    // Prevent any further operations or callbacks
    isCancelledRef.current = true;

    // Clear any pending timers (deferred callback + auto-close)
    if (callbackTimerRef.current) {
      clearTimeout(callbackTimerRef.current);
      callbackTimerRef.current = null;
    }
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }

    const error = new Error('User cancelled HiveAuth broadcast');

    // Only call onClose if it exists, otherwise call onError
    // Don't call both to avoid duplicate error handling
    if (payloadRef.current?.onClose) {
      payloadRef.current.onClose(error);
    } else {
      payloadRef.current?.onError?.(error);
    }

    ActionSheet.hide(sheetId);
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
