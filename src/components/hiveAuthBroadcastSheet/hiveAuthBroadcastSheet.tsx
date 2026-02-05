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

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SheetProps } from 'react-native-actions-sheet';
import ActionSheet from 'react-native-actions-sheet';
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
}

export const HiveAuthBroadcastSheet = ({
  sheetId,
  payload,
}: SheetProps<HiveAuthBroadcastSheetPayload>) => {
  const intl = useIntl();
  const hiveAuth = useHiveAuth();
  const currentAccount = useAppSelector(selectCurrentAccount);

  // Automatically start broadcast when sheet opens
  useEffect(() => {
    if (payload?.operations) {
      handleBroadcast();
    }
  }, [payload?.operations]);

  const handleBroadcast = async () => {
    const { operations, onSuccess, onError } = payload || {};

    if (!operations || operations.length === 0) {
      const error = new Error('No operations provided');
      onError?.(error);
      ActionSheet.hide(sheetId);
      return;
    }

    // Verify user is HiveAuth type
    const isHiveAuth = currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH;
    if (!isHiveAuth) {
      const error = new Error('Current account is not authenticated with HiveAuth');
      onError?.(error);
      ActionSheet.hide(sheetId);
      return;
    }

    try {
      const success = await hiveAuth.broadcast(operations);

      if (success) {
        onSuccess?.({ broadcast: true, operations });
        ActionSheet.hide(sheetId);
      } else {
        const error = new Error(
          intl.formatMessage({ id: 'hiveauth.transaction_fail' }) || 'HiveAuth broadcast failed',
        );
        onError?.(error);
        // Close sheet on failure as well
        ActionSheet.hide(sheetId);
      }
    } catch (error) {
      console.error('[HiveAuthBroadcastSheet] Broadcast failed', error);
      onError?.(error as Error);
      // Close sheet on error
      ActionSheet.hide(sheetId);
    }
  };

  const handleClose = () => {
    const error = new Error('User cancelled HiveAuth broadcast');
    payload?.onError?.(error);
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
              <Text>Preparing HiveAuth broadcast...</Text>
            </View>
          ) : (
            <StatusContent status={hiveAuth.status} statusText={hiveAuth.statusText} />
          )}
        </View>
      </View>
    </ActionSheet>
  );
};
