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

import React, { useCallback, useEffect, useRef } from 'react';
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

  useEffect(() => {
    isCancelledRef.current = false;
    broadcastStartedRef.current = false;
  }, [sheetId]);

  const handleBroadcast = useCallback(async () => {
    // Guard against duplicate invocations (e.g. fast re-renders)
    if (broadcastStartedRef.current) {
      return;
    }
    broadcastStartedRef.current = true;

    const { operations, onSuccess, onError } = payloadRef.current || {};

    if (!operations || operations.length === 0) {
      const error = new Error('No operations provided');
      if (!isCancelledRef.current) {
        onError?.(error);
        ActionSheet.hide(sheetId);
      }
      return;
    }

    // Verify user is HiveAuth type
    const isHiveAuth = currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH;
    if (!isHiveAuth) {
      const error = new Error('Current account is not authenticated with HiveAuth');
      if (!isCancelledRef.current) {
        onError?.(error);
        ActionSheet.hide(sheetId);
      }
      return;
    }

    try {
      const result = await hiveAuth.broadcast(operations);

      if (!isCancelledRef.current) {
        onSuccess?.(result);
        ActionSheet.hide(sheetId);
      }
    } catch (error) {
      if (!isCancelledRef.current) {
        console.error('[HiveAuthBroadcastSheet] Broadcast failed', error);
        onError?.(error as Error);
        ActionSheet.hide(sheetId);
      }
    }
  }, [sheetId, currentAccount?.local?.authType, hiveAuth.broadcast, intl]);

  // Automatically start broadcast when sheet opens with operations
  useEffect(() => {
    if (payload?.operations) {
      handleBroadcast();
    }
  }, [payload?.operations, handleBroadcast]);

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
