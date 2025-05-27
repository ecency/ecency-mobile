import React, { useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform, View, useWindowDimensions } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import styles from './qrModalStyles';
import { SheetNames } from '../../navigation/sheets';
import { useLinkProcessor } from '../../hooks';

export const QRModal = () => {
  const dim = useWindowDimensions();
  const linkProcessor = useLinkProcessor(() => SheetManager.hide(SheetNames.QR_SCAN));

  const device = useCameraDevice('back');
  const [isScannerActive, setIsScannerActive] = useState(true);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      console.log(`Scanned ${codes.length} codes!`, codes);
      if (codes[0].value) {
        setIsScannerActive(false);
        linkProcessor.handleLink(codes[0].value);
      }
    },
  });

  useEffect(() => {
    requestCameraPermission();
    setIsScannerActive(true);

    return () => {
      setIsScannerActive(false);
    };
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'ios') {
      const permissionStatus = await check(PERMISSIONS.IOS.CAMERA);
      if (permissionStatus !== RESULTS.GRANTED) {
        request(PERMISSIONS.IOS.CAMERA).then((result) => {
          if (result === RESULTS.GRANTED) {
            console.log('Camera permission granted');
          } else {
            console.log('Camera permission blocked');
            Alert.alert(
              'Unable to get Camera permission',
              'Please grant camera permission in ecency settings.',
              [
                {
                  text: 'Close',
                  onPress: () => {
                    _onClose();
                  },
                  style: 'cancel',
                },
                {
                  text: 'Allow',
                  onPress: () => {
                    openSettings();
                  },
                },
              ],
            );
          }
        });
      }
    }
    if (Platform.OS === 'android') {
      try {
        const permissionStatus = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (!permissionStatus) {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
            title: 'Ecency Camera Permission',
            message: 'To scan QR, Ecency needs your permission.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          });
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Camera permission granted');
          } else {
            console.log('Camera permission denied');
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const _onClose = () => {
    SheetManager.hide(SheetNames.QR_SCAN);
  };

  return (
    <ActionSheet
      gestureEnabled={true}
      snapPoints={[90]}
      containerStyle={{ ...styles.sheetContent, height: dim.height }}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.mainContainer}>
        {!!device && (
          <Camera
            style={EStyleSheet.absoluteFill}
            device={device}
            isActive={isScannerActive}
            codeScanner={codeScanner}
          />
        )}
      </View>
    </ActionSheet>
  );
};

export default QRModal;
