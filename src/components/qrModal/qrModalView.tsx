import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, View, Text } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useIntl } from 'react-intl';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import styles from './qrModalStyles';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { showActionModal, toastNotification, toggleQRModal } from '../../redux/actions/uiAction';
import { deepLinkParser } from '../../utils/deepLinkParser';
import RootNavigation from '../../navigation/rootNavigation';
import getWindowDimensions from '../../utils/getWindowDimensions';
import { isHiveUri } from '../../utils/hive-uri';
import { handleHiveUriOperation } from '../../providers/hive/dhive';
import bugsnagInstance from '../../config/bugsnag';
import { get, isArray } from 'lodash';
import showLoginAlert from '../../utils/showLoginAlert';

const hiveuri = require('hive-uri');
const screenHeight = getWindowDimensions().height;
interface QRModalProps {}

export const QRModal = ({}: QRModalProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const isVisibleQRModal = useAppSelector((state) => state.ui.isVisibleQRModal);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const sheetModalRef = useRef<ActionSheet>();
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isVisibleQRModal) {
      requestCameraPermission();
      sheetModalRef?.current?.show();
    } else {
      sheetModalRef?.current?.hide();
    }
  }, [isVisibleQRModal]);

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
    dispatch(toggleQRModal(false));
  };

  const onSuccess = (e) => {
    setIsScannerActive(false);
    if (isHiveUri(e.data)) {
      _handleHiveUri(e.data);
    } else {
      _handleDeepLink(e.data);
    }
  };

  const _handleHiveUri = (uri: string) => {
    try {
      setIsScannerActive(false);
      _onClose();
      if (!isLoggedIn) {
        showLoginAlert({ intl });
        return;
      }
      const parsed = hiveuri.decode(uri);
      // resolve the decoded tx and params to a signable tx
      let { tx, signer } = hiveuri.resolveTransaction(parsed.tx, parsed.params, {
        signers: currentAccount.name,
        preferred_signer: currentAccount.name,
      });
      const operations = get(tx, 'operations', []);
      dispatch(
        showActionModal({
          title: intl.formatMessage({
            id: 'qr.confirmTransaction',
          }),
          bodyContent: _checkOpsArray(operations) ? _renderActionModalBody(operations[0]) : null,
          buttons: [
            {
              text: intl.formatMessage({
                id: 'qr.cancel',
              }),
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: intl.formatMessage({
                id: 'qr.approve',
              }),
              onPress: () => {
                handleHiveUriOperation(currentAccount, pinCode, uri)
                  .then(() => {
                    dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
                  })
                  .catch((err) => {
                    bugsnagInstance.notify(err);
                    dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
                  });
              },
            },
          ],
        }),
      );
    } catch (err) {
      _showInvalidAlert();
    }
  };

  const _handleDeepLink = async (url) => {
    setIsProcessing(true);
    const deepLinkData = await deepLinkParser(url);
    const { name, params, key } = deepLinkData || {};
    setIsProcessing(false);
    if (name && params && key) {
      setIsScannerActive(false);
      _onClose();
      RootNavigation.navigate(deepLinkData);
    } else {
      _showInvalidAlert();
    }
  };

  // check operation array is valid and is a single operation array
  const _checkOpsArray = (ops) => {
    return ops && isArray(ops) && ops.length === 1 && isArray(ops[0]) && ops[0].length === 2;
  };

  const _renderTransactionInfoRow = (item: any) => (
    <View style={styles.transactionRow}>
      <Text style={styles.transactionItem1}>{item[0]}</Text>
      <Text style={styles.transactionItem2}>{item[1]}</Text>
    </View>
  );
  const _renderActionModalBody = (operations: any) => (
    <View style={styles.transactionBodyContainer}>
      {Object.entries(operations[1]).map((item) => _renderTransactionInfoRow(item))}
    </View>
  );
  const _showInvalidAlert = () => {
    Alert.alert(
      intl.formatMessage({ id: 'qr.unsupported_alert_title' }),
      intl.formatMessage({ id: 'qr.unsupported_alert_desc' }),
      [
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
      ],
    );
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
            <ActivityIndicator color="white" style={styles.activityIndicator} />
          </View>
        )}
      </View>
    </ActionSheet>
  );
};

export default QRModal;
