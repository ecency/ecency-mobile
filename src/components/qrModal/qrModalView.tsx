import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useIntl } from 'react-intl';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import styles from './qrModalStyles';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  setRcOffer,
  showActionModal,
  toastNotification,
  toggleQRModal,
} from '../../redux/actions/uiAction';
import { deepLinkParser } from '../../utils/deepLinkParser';
import RootNavigation from '../../navigation/rootNavigation';
import getWindowDimensions from '../../utils/getWindowDimensions';
import { isHiveUri } from '../../utils/hive-uri';
import { transferToken, vote } from '../../providers/hive/dhive';
import { useUserActivityMutation } from '../../providers/queries';
import { PointActivityIds } from '../../providers/ecency/ecency.types';
import bugsnagInstance from '../../config/bugsnag';

interface QRModalProps {}
const hiveuri = require('hive-uri');
const screenHeight = getWindowDimensions().height;

export const QRModal = ({}: QRModalProps) => {
  const userActivityMutation = useUserActivityMutation();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const isVisibleQRModal = useAppSelector((state) => state.ui.isVisibleQRModal);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

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
      // const uri =
      //   'hive://sign/op/WyJ0cmFuc2ZlciIseyJmcm9tIjoiZGVtby5jb20iLCJ0byI6ImFsaXNleWFsdmkiLCJhbW91bnQiOiIwLjAwMiBISVZFIiwibWVtbyI6InRlc3RpbmcgaGl2ZSB1cmkifV0.';
      // const uri =
      //   'hive://sign/op/WyJ2b3RlIix7InZvdGVyIjoiZGVtby5jb20iLCJhdXRob3IiOiJhbGlzZXlhbHZpIiwicGVybWxpbmsiOiJkZW1vLXBvc3QiLCJ3ZWlnaHQiOiIxMDAifV0.';
      const { params, tx } = hiveuri.decode(uri);
      setIsScannerActive(false);
      _onClose();
      // console.log('parsedHiveUri : ', JSON.stringify(tx, null, 2), params);
      // Alert.alert('parsed uri ', JSON.stringify(tx));
      if (tx.operations && tx.operations.length === 1) {
        _handleHiveUriOperation(tx.operations[0]);
      } else {
        Alert.alert(
          'Error while parsing operation',
          'looka like operation object is not encoded properly ',
        );
      }
    } catch (err) {
      _showInvalidAlert();
    }
  };

  const _handleHiveUriOperation = (hiveUriOperation: any) => {
    if (hiveUriOperation && hiveUriOperation.length > 0) {
      switch (hiveUriOperation[0]) {
        case 'vote':
          _handleVoteOperation(hiveUriOperation[1]);
          break;
        case 'transfer':
          _handleTransferOperation(hiveUriOperation[1]);
          break;
        default:
          Alert.alert('Unsupported Operation!', 'This operation is not currently supported');
      }
    }
  };

  const _handleVoteOperation = (operation: any) => {
    const { voter, author, permlink, weight } = operation;

    dispatch(
      showActionModal({
        title: intl.formatMessage({
          id: 'qr.confirmTransaction',
        }),
        body: JSON.stringify(operation),
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
              vote(currentAccount, pinCode, author, permlink, parseInt(weight))
                .then((response) => {
                  console.log('Vote response: ', response);
                  // record user points
                  userActivityMutation.mutate({
                    pointsTy: PointActivityIds.VOTE,
                    transactionId: response.id,
                  });

                  if (!response || !response.id) {
                    dispatch(
                      toastNotification(
                        intl.formatMessage(
                          { id: 'alert.something_wrong_msg' },
                          {
                            message: intl.formatMessage({
                              id: 'alert.invalid_response',
                            }),
                          },
                        ),
                      ),
                    );

                    return;
                  }
                  dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
                })
                .catch((err) => {
                  if (
                    err &&
                    err.response &&
                    err.response.jse_shortmsg &&
                    err.response.jse_shortmsg.includes('wait to transact')
                  ) {
                    // when RC is not enough, offer boosting account
                    // setIsVoted(false);
                    dispatch(setRcOffer(true));
                  } else if (
                    err &&
                    err.jse_shortmsg &&
                    err.jse_shortmsg.includes('wait to transact')
                  ) {
                    // when RC is not enough, offer boosting account
                    // setIsVoted(false);
                    dispatch(setRcOffer(true));
                  } else {
                    // // when voting with same percent or other errors
                    let errMsg = '';
                    if (err.message && err.message.indexOf(':') > 0) {
                      errMsg = err.message.split(': ')[1];
                    } else {
                      errMsg = err.jse_shortmsg || err.error_description || err.message;
                    }
                    dispatch(
                      toastNotification(
                        intl.formatMessage(
                          { id: 'alert.something_wrong_msg' },
                          { message: errMsg },
                        ),
                      ),
                    );
                  }
                });
            },
          },
        ],
      }),
    );
  };

  const _handleTransferOperation = (operation: any) => {
    const { from, to, amount, memo } = operation;
    const data = {
      from,
      destination: to,
      amount,
      memo,
    };

    dispatch(
      showActionModal({
        title: intl.formatMessage({
          id: 'qr.confirmTransaction',
        }),
        body: JSON.stringify(operation),
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
              transferToken(currentAccount, pinCode, data)
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
