import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';

import { useIntl } from 'react-intl';
import ActionSheet from 'react-native-actions-sheet';
import type { Operation } from '@ecency/sdk';
import styles from '../styles/hiveAuthModal.styles';
import { useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import { selectIsPinCodeOpen } from '../../../redux/selectors';
import RootNavigation from '../../../navigation/rootNavigation';

import { ModalHeader } from '../..';

import { AuthInputContent } from '../children/authInputContent';
import { StatusContent } from '../children/statusContent';
import { HiveAuthStatus, useHiveAuth } from '../hooks/useHiveAuth';

interface HiveAuthModalProps {
  onClose?: () => void;
}

export const HiveAuthModal = forwardRef(({ onClose }: HiveAuthModalProps, ref) => {
  const intl = useIntl();
  const hiveAuth = useHiveAuth();

  const isPinCodeOpen = useAppSelector(selectIsPinCodeOpen);

  const bottomSheetModalRef = useRef();
  const isMountedRef = useRef(true);
  const successNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initUsername, setInitUsername] = useState<string>();

  useImperativeHandle(ref, () => ({
    showModal: (_username?: string) => {
      setInitUsername(_username);
      bottomSheetModalRef.current?.show();
    },
    broadcastActiveOps: (opsArray: any) => {
      if (opsArray) {
        bottomSheetModalRef.current?.show();
        handleBroadcastRequest(opsArray);
      }
    },
  }));

  const handleAuthRequest = async (username: string) => {
    const success = await hiveAuth.authenticate(username);

    // Close modal and navigate on success
    if (success) {
      // Close the modal first to show the account switch
      _closeModal();

      // Small delay to let modal close animation finish and Redux updates to propagate
      successNavTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) {
          return;
        }

        // Use RootNavigation to ensure we navigate from the root navigator
        // This properly handles cases where HiveAuth is opened from Login screen
        console.log('[HiveAuth] Navigating to main after successful login');
        if (isPinCodeOpen) {
          RootNavigation.reset({
            index: 0,
            routes: [
              {
                name: ROUTES.SCREENS.PINCODE,
                params: {
                  navigateTo: ROUTES.DRAWER.MAIN,
                },
              },
            ],
          });
        } else {
          RootNavigation.reset({
            index: 0,
            routes: [{ name: ROUTES.DRAWER.MAIN }],
          });
        }
      }, 500); // Increased delay to ensure Redux updates complete
    }
  };

  const handleBroadcastRequest = async (opsArray: Operation[]) => {
    try {
      const result = await hiveAuth.broadcast(opsArray);
      if (result) {
        _closeModal();
      }
    } catch {
      // useHiveAuth handles status/error state
    }
  };

  const _closeModal = () => {
    bottomSheetModalRef.current?.hide();
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (successNavTimerRef.current) {
        clearTimeout(successNavTimerRef.current);
        successNavTimerRef.current = null;
      }
    };
  }, []);

  const _renderContent = () => {
    const _content =
      hiveAuth.status === HiveAuthStatus.INPUT ? (
        <AuthInputContent initUsername={initUsername} handleAuthRequest={handleAuthRequest} />
      ) : (
        <StatusContent status={hiveAuth.status} statusText={hiveAuth.statusText} />
      );

    return (
      <View style={styles.container}>
        <ModalHeader
          modalHeaderContainerStyle={styles.modalHeader}
          title={intl.formatMessage({ id: 'hiveauth.title' })}
          isCloseButton={true}
          onClosePress={_closeModal}
        />

        <View style={styles.content}>{_content}</View>
      </View>
    );
  };

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={false}
      hideUnderlay={true}
      onClose={() => {
        hiveAuth.reset();
        setInitUsername(undefined);
      }}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      {_renderContent()}
    </ActionSheet>
  );
});
