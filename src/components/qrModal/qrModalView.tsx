import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './qrModalStyles';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toggleQRModal } from '../../redux/actions/uiAction';

export interface QRModalProps {}

export const QRModal = ({}: QRModalProps) => {
  const sheetModalRef = useRef<ActionSheet>();
  const dispatch = useAppDispatch();
    
  const isVisibleQRModal = useAppSelector((state) => state.ui.isVisibleQRModal);

  useEffect(() => {
    if (isVisibleQRModal) {
      sheetModalRef.current.show();
    } else {
      sheetModalRef.current.hide();
    }
  }, [isVisibleQRModal]);

  const _onClose = () => {
    dispatch(toggleQRModal(false));
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      onClose={_onClose}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      <View>
        <Text>QR Modal</Text>
      </View>
    </ActionSheet>
  );
};

export default QRModal