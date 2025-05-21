import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';

import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from 'react-native-actions-sheet';
import { Operation } from '@hiveio/dhive';
import styles from '../styles/hiveAuthModal.styles';
import { useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';

import { ModalHeader } from '../..';

import { AuthInputContent } from '../children/authInputContent';
import { StatusContent } from '../children/statusContent';
import { HiveAuthStatus, useHiveAuth } from '../hooks/useHiveAuth';

interface HiveAuthModalProps {
  onClose?: () => void;
}

export const HiveAuthModal = forwardRef(({ onClose }: HiveAuthModalProps, ref) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const hiveAuth = useHiveAuth();

  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);

  const bottomSheetModalRef = useRef();

  const [initUsername, setInitUsername] = useState<string>();

  useImperativeHandle(ref, () => ({
    showModal: (_username?: string) => {
      setInitUsername(_username);
      bottomSheetModalRef.current?.show();
    },
    broadcastActiveOps: (opsArray: any) => {
      if (opsArray) {
        bottomSheetModalRef.current?.show();
        handleBroadcastRequst(opsArray);
      }
    },
  }));

  const handleAuthRequest = async (username: string) => {
    const success = await hiveAuth.authenticate(username);

    // isLoggedInt
    if (success) {
      if (isPinCodeOpen) {
        navigation.navigate({
          name: ROUTES.SCREENS.PINCODE,
          params: {
            navigateTo: ROUTES.DRAWER.MAIN,
          },
        });
      } else {
        navigation.navigate({
          name: ROUTES.DRAWER.MAIN,
        });
      }
    }
  };

  const handleBroadcastRequst = async (opsArray: Operation[]) => {
    const success = await hiveAuth.broadcast(opsArray);
    if (success) {
      _closeModal();
    }
  };

  const _closeModal = () => {
    bottomSheetModalRef.current?.hide();
    if (onClose) {
      onClose();
    }
  };

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
