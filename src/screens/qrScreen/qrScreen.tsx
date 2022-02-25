import React, { Fragment, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { View, Text, ScrollView, Button, TouchableOpacity, Dimensions } from 'react-native';
import { BasicHeader, MainButton } from '../../components';
import QRCodeScanner from 'react-native-qrcode-scanner';

// styles
import styles from './qrScreenStyle';

//
const screenWidth = Dimensions.get('screen').width;
const QRScreen = () => {
  const intl = useIntl();
  const [isActive, setIsActive] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);
  const onSuccess = (e) => {
    setScanResult(e.data);
    setIsActive(false);
  };

  const _handleOpen = () => {
    console.log('scanResult : ', scanResult);
  };
  const _renderBottomContent = () => {
    return (
      <View style={styles.bottomContent}>
        <Text>Detected URL:</Text>
        <Text>{scanResult}</Text>
        
        <MainButton
          // isLoading={isLoading}
          isDisable={isActive}
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
          cameraStyle={{ alignSelf: 'center', justifyContent: 'center', width: 200 }}
          cameraProps={{}}
        />
      </View>
    </Fragment>
  );
};

export default QRScreen;
