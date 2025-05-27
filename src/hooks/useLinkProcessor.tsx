import { useEffect } from 'react';
import { Alert, View, Text, ViewStyle, TextStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import { SheetManager } from 'react-native-actions-sheet';
import { get } from 'lodash';
import { useIntl } from 'react-intl';
import * as hiveuri from 'hive-uri';
import EStyleSheet from 'react-native-extended-stylesheet';
import { toastNotification } from '../redux/actions/uiAction';
import { handleHiveUriOperation, resolveTransaction } from '../providers/hive/dhive';
import { getFormattedTx, isHiveUri } from '../utils/hive-uri';
import { deepLinkParser } from '../utils/deepLinkParser';
import showLoginAlert from '../utils/showLoginAlert';
import RootNavigation from '../navigation/rootNavigation';
import ROUTES from '../constants/routeNames';
import { delay } from '../utils/editor';
import { SheetNames } from '../navigation/sheets';
import getWindowDimensions from '../utils/getWindowDimensions';
import { useAppSelector } from './index';
import authType from '../constants/authType';

export const useLinkProcessor = (onClose?: () => void) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  const handleLink = (deeplink: string) => {
    if (isHiveUri(deeplink)) {
      _handleHiveUri(deeplink);
    } else {
      _handleDeepLink(deeplink);
    }
  };

  const _handleHiveUri = async (uri: string) => {
    try {
      onClose && onClose();
      if (!isLoggedIn) {
        showLoginAlert({ intl });
        return;
      }
      if (isPinCodeOpen) {
        RootNavigation.navigate({
          name: ROUTES.SCREENS.PINCODE,
          params: {
            callback: () => _handleHiveUriTransaction(uri),
          },
        });
      } else {
        _handleHiveUriTransaction(uri);
      }
    } catch (err) {
      _showInvalidAlert();
    }
  };

  const _handleHiveUriTransaction = async (uri: string) => {
    if (get(currentAccount, 'local.authType') === authType.STEEM_CONNECT) {
      await delay(500); // NOTE: it's required to avoid modal misfire
      RootNavigation.navigate({
        name: ROUTES.MODALS.HIVE_SIGNER,
        params: {
          hiveuri: uri,
        },
      });
      return;
    }

    const parsed = hiveuri.decode(uri);
    const authoritiesMap = new Map();
    authoritiesMap.set('active', !!currentAccount?.local?.activeKey);
    authoritiesMap.set('posting', !!currentAccount?.local?.postingKey);
    authoritiesMap.set('owner', !!currentAccount?.local?.ownerKey);
    authoritiesMap.set('memo', !!currentAccount?.local?.memoKey);

    getFormattedTx(parsed.tx, authoritiesMap)
      .then(async (formattedTx) => {
        const tx = await resolveTransaction(formattedTx.tx, parsed.params, currentAccount.name);
        const ops = get(tx, 'operations', []);
        const op = ops[0];
        SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'qr.confirmTransaction' }),
            bodyContent: _renderActionModalBody(op, formattedTx.opName),
            buttons: [
              {
                text: intl.formatMessage({ id: 'qr.cancel' }),
                onPress: () => console.log('cancel pressed'),
                style: 'cancel',
              },
              {
                text: intl.formatMessage({ id: 'qr.approve' }),
                onPress: () => {
                  handleHiveUriOperation(currentAccount, pinCode, tx)
                    .then(() => {
                      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
                    })
                    .catch((err) => {
                      if (err) {
                        dispatch(toastNotification(intl.formatMessage({ id: err })));
                      } else {
                        dispatch(
                          toastNotification(intl.formatMessage({ id: 'qr.transaction_failed' })),
                        );
                      }
                    });
                },
              },
            ],
          },
        });
      })
      .catch((errObj: any) => {
        Alert.alert(
          intl.formatMessage({ id: errObj.errorKey1 }, { key: errObj.authorityKeyType }),
          intl.formatMessage({ id: errObj.errorKey2 }, { key: errObj.authorityKeyType }),
        );
      });
  };

  const _handleDeepLink = async (url: string) => {
    const deepLinkData = await deepLinkParser(url);
    const { name, params, key } = deepLinkData || {};
    if (name && params && key) {
      onClose && onClose();
      RootNavigation.navigate(deepLinkData);
    } else {
      _showInvalidAlert();
    }
  };

  const _renderTransactionInfoRow = (item: string[]) => (
    <View style={styles.transactionRow}>
      <Text numberOfLines={1} style={styles.transactionItem1}>
        {item[0]}
      </Text>
      <Text numberOfLines={1} style={styles.transactionItem2}>
        {item[1]}
      </Text>
    </View>
  );

  const _renderActionModalBody = (operations: any[], opName: string) => (
    <View style={styles.transactionBodyContainer}>
      <View style={styles.transactionHeadingContainer}>
        <Text style={styles.transactionHeading}> {opName} </Text>
      </View>
      <View style={styles.transactionItemsContainer}>
        {Object.entries(operations[1]).map((item) => _renderTransactionInfoRow(item as string[]))}
      </View>
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
            onClose && onClose();
          },
          style: 'cancel',
        },
      ],
    );
  };

  useEffect(() => {
    // Add event listener for deep links here if needed
    return () => {
      // Cleanup event listener if added
    };
  }, []);

  return { handleLink };
};

const { width: SCREEN_WIDTH } = getWindowDimensions();
const styles = EStyleSheet.create({
  transactionBodyContainer: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    // padding: 8,
    marginVertical: 10,
    width: SCREEN_WIDTH - 64,
  } as ViewStyle,
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  } as ViewStyle,
  transactionHeadingContainer: {
    borderBottomWidth: 1,
    borderColor: '$borderColor',
    height: 36,
    paddingHorizontal: 8,
    justifyContent: 'center',
  } as ViewStyle,
  transactionHeading: {
    color: '$primaryBlack',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  } as TextStyle,
  transactionItemsContainer: {
    padding: 8,
  } as ViewStyle,
  transactionItem1: {
    color: '$primaryBlack',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textTransform: 'capitalize',
  } as TextStyle,
  transactionItem2: {
    color: '$primaryBlack',
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  } as TextStyle,
});
