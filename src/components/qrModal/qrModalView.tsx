import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './qrModalStyles';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toggleQRModal } from '../../redux/actions/uiAction';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { deepLinkParser } from '../../utils/deepLinkParser';
import { useIntl } from 'react-intl';
import { navigate } from '../../navigation/service';
import { Icon, MainButton } from '..';
import { Dimensions } from 'react-native';

export interface QRModalProps {}

const screenHeight = Dimensions.get("window").height
export const QRModal = ({}: QRModalProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const isVisibleQRModal = useAppSelector((state) => state.ui.isVisibleQRModal);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [isActive, setIsActive] = useState(true);
  const [scanURL, setScanURL] = useState(null);
  const [navData, setNavData] = useState(null);
  const [isURLValid, setIsURLValid] = useState(false);

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
    _handleDeepLink(e.data);
    setIsActive(false);
  };

  const _handleDeepLink = async (url) => {
    const deepLinkData = await deepLinkParser(url, currentAccount);
    const { routeName, params, key } = deepLinkData || {};
    setNavData(routeName && params && key ? deepLinkData : null);
    setIsURLValid(routeName && params && key ? true : false);
    setScanURL(url);
  };

  const _handleOpen = () => {
    if (navData) {
      _onClose()
      navigate(navData);
    }
  };
  
  const _renderBottomContent = () => {
    return (
      <View style={styles.bottomContent}>
        <View style={styles.urlContainer}>
          <View style={styles.urlTextContainer}>
            <Text>
              {intl.formatMessage({
                id: 'qr.detected_url',
              })}
              :
            </Text>
            <Text>{scanURL}</Text>
          </View>
          <View style={styles.validIcon}>
            {scanURL && (
              <Icon
                iconType="Ionicons"
                name={isURLValid ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={20}
                color={isURLValid ? 'green' : 'red'}
              />
            )}
          </View>
        </View>
        <MainButton
          // isLoading={isLoading}
          isDisable={isActive || !isURLValid}
          style={styles.mainButton}
          height={50}
          onPress={_handleOpen}
        >
          <View style={styles.mainButtonWrapper}>
            <Text style={styles.openText}>
              {intl.formatMessage({
                id: 'qr.open',
              })}
            </Text>
          </View>
        </MainButton>
      </View>
    );
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      containerStyle={{...styles.sheetContent, height: screenHeight }}
      onClose={_onClose}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
   
    >
      <View style={styles.mainContainer}>
      {/* <Text>QR Modal</Text> */}

        <QRCodeScanner
          reactivate={isActive}
          showMarker={true}
          ref={scannerRef}
          onRead={onSuccess}
          topViewStyle={{ display: 'none' }}
          bottomViewStyle={{display:'none'}}
          containerStyle={styles.scannerContainer}
          cameraContainerStyle={styles.cameraContainer}
          cameraStyle={styles.cameraStyle}
        />
      </View>
    </ActionSheet>
  );
};

export default QRModal;
