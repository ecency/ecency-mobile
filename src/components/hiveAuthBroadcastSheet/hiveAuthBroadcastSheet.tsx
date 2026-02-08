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

import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import { Operation } from '@hiveio/dhive';
import { useHiveAuth, HiveAuthStatus } from '../hiveAuthModal/hooks/useHiveAuth';
import { ModalHeader } from '../modalHeader';
import { StatusContent } from '../hiveAuthModal/children/statusContent';
import AUTH_TYPE from '../../constants/authType';
import { useAppSelector } from '../../hooks';
import { selectCurrentAccount } from '../../redux/selectors';
import RootNavigation from '../../navigation/rootNavigation';
import ROUTES from '../../constants/routeNames';
import styles from '../hiveAuthModal/styles/hiveAuthModal.styles';

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

  // Keep a ref to payload so the broadcast callback always reads the latest value
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  // Store stable refs for values needed in broadcast effect
  const sheetIdRef = useRef(sheetId);
  const currentAccountAuthTypeRef = useRef(currentAccount?.local?.authType);
  const currentAccountUsernameRef = useRef(currentAccount?.name ?? currentAccount?.username);
  const hiveAuthBroadcastRef = useRef(hiveAuth.broadcast);

  sheetIdRef.current = sheetId;
  currentAccountAuthTypeRef.current = currentAccount?.local?.authType;
  currentAccountUsernameRef.current = currentAccount?.name ?? currentAccount?.username;
  hiveAuthBroadcastRef.current = hiveAuth.broadcast;

  // Reset refs when new operations arrive (not just when sheetId changes)
  // This ensures that if the sheet is reused with the same sheetId,
  // the refs are still reset for the new broadcast operation
  useEffect(() => {
    isCancelledRef.current = false;
    broadcastStartedRef.current = false;
  }, [payload?.operations]);

  // Automatically start broadcast when sheet opens with operations
  // This effect intentionally does NOT depend on handleBroadcast to prevent race conditions
  // caused by the callback being recreated on every render when dependencies change
  useEffect(() => {
    const { operations, onSuccess, onError } = payloadRef.current || {};

    if (!operations || operations.length === 0) {
      return;
    }

    // Guard against duplicate invocations (e.g. fast re-renders or multiple effect runs)
    if (broadcastStartedRef.current) {
      return;
    }
    broadcastStartedRef.current = true;

    // Verify user is HiveAuth type
    const isHiveAuth = currentAccountAuthTypeRef.current === AUTH_TYPE.HIVE_AUTH;
    if (!isHiveAuth) {
      const error = new Error('Current account is not authenticated with HiveAuth');
      if (!isCancelledRef.current) {
        onError?.(error);
        ActionSheet.hide(sheetIdRef.current);
      }
      return;
    }

    const executeBroadcast = async () => {
      try {
        const result = await hiveAuthBroadcastRef.current(operations);

        if (!isCancelledRef.current) {
          onSuccess?.(result);
          ActionSheet.hide(sheetIdRef.current);
        }
      } catch (error) {
        if (!isCancelledRef.current) {
          console.error('[HiveAuthBroadcastSheet] Broadcast failed', error);

          // Check if error is auth expiry - if so, navigate to login after hiding sheet
          const isAuthExpired =
            (error as Error)?.message?.includes('auth_expired') ||
            (error as Error)?.message?.includes('expired');

          if (isAuthExpired) {
            console.log('[HiveAuthBroadcastSheet] Auth expired, navigating to login');
            // Hide sheet first to avoid visual overlap
            ActionSheet.hide(sheetIdRef.current);

            // Navigate to login screen after a small delay to let sheet close
            setTimeout(() => {
              RootNavigation.navigate({
                name: ROUTES.SCREENS.LOGIN,
                params: { username: currentAccountUsernameRef.current },
              });
            }, 300);
          } else {
            ActionSheet.hide(sheetIdRef.current);
          }

          onError?.(error as Error);
        }
      }
    };

    executeBroadcast();
    // Only re-run when operations change (reference equality check)
    // We intentionally omit hiveAuthBroadcastRef, sheetIdRef, and other refs from dependencies
    // because they are kept up-to-date via ref assignments and don't need to trigger re-runs
  }, [payload?.operations]);

  const handleClose = () => {
    const error = new Error('User cancelled HiveAuth broadcast');
    isCancelledRef.current = true;
    payloadRef.current?.onClose?.(error);
    payloadRef.current?.onError?.(error);
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
