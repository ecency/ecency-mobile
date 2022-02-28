import React, { Fragment, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { View, Text } from 'react-native';
import { BasicHeader, Icon, MainButton } from '../../components';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useAppSelector } from '../../hooks';
import { navigate } from '../../navigation/service';
import { deepLinkParser } from '../../utils/deepLinkParser';
// styles
import styles from './qrScreenStyle';

const QRScreen = () => {
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [isActive, setIsActive] = useState(true);
  const [scanURL, setScanURL] = useState(null);
  const [navData, setNavData] = useState(null);
  const [isURLValid, setIsURLValid] = useState(false);

  const scannerRef = useRef(null);
  const onSuccess = (e) => {
    _handleDeepLink(e.data);
    setIsActive(false);
  };

  const _handleOpen = () => {
    if (navData) {
      navigate(navData);
    }
  };

  const _handleDeepLink = async (url) => {
    const deepLinkData = await deepLinkParser(url, currentAccount);
    const { routeName, params, key } = deepLinkData || {};
    setNavData(routeName && params && key ? deepLinkData : null);
    setIsURLValid(routeName && params && key ? true : false);
    setScanURL(url);
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
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'qr.qr_scan',
        })}
      />
      <View style={styles.mainContainer}>
        <QRCodeScanner
          reactivate={isActive}
          showMarker={true}
          ref={scannerRef}
          onRead={onSuccess}
          topViewStyle={{ display: 'none' }}
          bottomContent={_renderBottomContent()}
          containerStyle={styles.scannerContainer}
          cameraContainerStyle={styles.cameraContainer}
          cameraStyle={styles.cameraStyle}
        />
      </View>
    </Fragment>
  );
};

export default QRScreen;
