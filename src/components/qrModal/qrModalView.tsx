import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './qrModalStyles';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toggleQRModal } from '../../redux/actions/uiAction';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { deepLinkParser } from '../../utils/deepLinkParser';
import { useIntl } from 'react-intl';
import { navigate } from '../../navigation/service';
import { Icon } from '..';
import { Dimensions } from 'react-native';

export interface QRModalProps {}

const screenHeight = Dimensions.get('window').height;
export const QRModal = ({}: QRModalProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const isVisibleQRModal = useAppSelector((state) => state.ui.isVisibleQRModal);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const sheetModalRef = useRef<ActionSheet>();
  const scannerRef = useRef(null);

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

  const onSuccess = (e) => {
    setIsScannerActive(false);
    _handleDeepLink(e.data);
  };

  const _handleDeepLink = async (url) => {
    setIsProcessing(true);
    const deepLinkData = await deepLinkParser(url, currentAccount);
    const { routeName, params, key } = deepLinkData || {};
    setIsProcessing(false);
    if (routeName && params && key) {
      setIsScannerActive(false);
      _onClose();
      navigate(deepLinkData);
    } else {
      Alert.alert('Unsupported URL!', 'Please scan a valid ecency url.', [
        {
          text: 'Close',
          onPress: () => {
            _onClose();
          },
          style: 'cancel',
        },
        {
          text: 'Rescan',
          onPress: () => {
            setIsScannerActive(true);
            scannerRef.current?.reactivate();
          },
        },
      ]);
    }
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      containerStyle={{ ...styles.sheetContent, height: screenHeight }}
      onClose={_onClose}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      <View style={styles.mainContainer}>
        <QRCodeScanner
          reactivate={isScannerActive}
          showMarker={true}
          ref={scannerRef}
          onRead={onSuccess}
          topViewStyle={{ display: 'none' }}
          bottomViewStyle={{ display: 'none' }}
          containerStyle={styles.scannerContainer}
          cameraContainerStyle={styles.cameraContainer}
          cameraStyle={styles.cameraStyle}
        />
        {isProcessing && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator color={'white'} style={styles.activityIndicator} />
          </View>
        )}
      </View>
    </ActionSheet>
  );
};

export default QRModal;
