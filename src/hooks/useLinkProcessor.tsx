import { useEffect } from 'react';
import { Alert, View, Text, ViewStyle, TextStyle, Linking } from 'react-native';
import { useDispatch } from 'react-redux';
import { SheetManager } from 'react-native-actions-sheet';
import { get } from 'lodash';
import { useIntl } from 'react-intl';
import * as hiveuri from 'hive-uri';
import EStyleSheet from 'react-native-extended-stylesheet';
import { toastNotification } from '../redux/actions/uiAction';
import {
  handleHiveUriOperation,
  resolveTransaction,
  getDigitPinCode,
} from '../providers/hive/dhive';
import { getFormattedTx, isHiveUri, normalizeHiveUri } from '../utils/hive-uri';
import { deepLinkParser } from '../utils/deepLinkParser';
import showLoginAlert from '../utils/showLoginAlert';
import RootNavigation from '../navigation/rootNavigation';
import ROUTES from '../constants/routeNames';
import { delay } from '../utils/editor';
import { SheetNames } from '../navigation/sheets';
import getWindowDimensions from '../utils/getWindowDimensions';
import { useAppSelector } from './index';
import authType from '../constants/authType';
import { getUserDataWithUsername } from '../realm/realm';
import { decryptKey } from '../utils/crypto';

export const useLinkProcessor = (onClose?: () => void) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const otherAccounts = useAppSelector((state) => state.account.otherAccounts);
  const pinCode = useAppSelector((state) => state.application.pin);

  const _isEcencyLoginDeeplink = (deeplink: string) => {
    try {
      const parsedUrl = new URL(deeplink);
      return (
        parsedUrl.protocol.toLowerCase() === 'ecency:' &&
        parsedUrl.hostname.toLowerCase() === 'login'
      );
    } catch (err) {
      return false;
    }
  };

  const _getStoredUserData = async (username: string) => {
    try {
      const userData = await getUserDataWithUsername(username);
      if (Array.isArray(userData) && userData.length > 0) {
        return userData[0];
      }
    } catch (err) {
      console.warn('Failed to get user data for login deeplink', err);
    }
    return null;
  };

  const _openCallback = async (
    callback: string,
    requestId: string | null,
    payload: Record<string, string>,
  ) => {
    try {
      const callbackUrl = new URL(callback);
      Object.entries(payload).forEach(([key, value]) => {
        if (value) {
          callbackUrl.searchParams.set(key, value);
        }
      });
      if (requestId) {
        callbackUrl.searchParams.set('request_id', requestId);
      }

      await Linking.openURL(callbackUrl.toString());
    } catch (err) {
      console.warn('Failed to open callback url', err);
      _showInvalidAlert();
    }
  };

  const _getRequesterLabel = (callback: string) => {
    try {
      const callbackUrl = new URL(callback);
      const scheme = callbackUrl.protocol ? `${callbackUrl.protocol}//` : '';
      const authority = callbackUrl.host || '';
      const path = callbackUrl.pathname && callbackUrl.pathname !== '/' ? callbackUrl.pathname : '';

      if (scheme || authority || path) {
        return `${scheme}${authority}${path}`;
      }

      return callback;
    } catch (error) {
      return callback;
    }
  };

  const _confirmPostingKeyShare = (username: string, requesterLabel: string) =>
    new Promise<boolean>((resolve) => {
      const requesterText = requesterLabel
        ? `${requesterLabel} is requesting the posting private key for @${username}.`
        : `Another application is requesting the posting private key for @${username}.`;

      Alert.alert(
        intl.formatMessage({ id: 'alert.confirm' }),
        `${requesterText}\n\nOnly continue if you trust this request.`,
        [
          {
            text: intl.formatMessage({ id: 'qr.cancel' }),
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: intl.formatMessage({ id: 'qr.approve' }),
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false },
      );
    });

  const _handleEcencyLoginDeeplink = async (deeplink: string) => {
    try {
      onClose && onClose();

      const loginUrl = new URL(deeplink);
      const usernameParam = loginUrl.searchParams.get('username');
      const callbackParam =
        loginUrl.searchParams.get('callback') ||
        loginUrl.searchParams.get('redirect_uri') ||
        loginUrl.searchParams.get('return_url');
      const requestId = loginUrl.searchParams.get('request_id');

      if (!usernameParam || !callbackParam) {
        _showInvalidAlert();
        return;
      }

      const normalizedUsername = usernameParam.replace(/^@/, '').trim().toLowerCase();
      if (!normalizedUsername) {
        _showInvalidAlert();
        return;
      }

      const currentAccountName = (currentAccount?.name || '').toLowerCase();
      const isKnownAccount =
        currentAccountName === normalizedUsername ||
        otherAccounts?.some(
          (account) => (account?.username || '').toLowerCase() === normalizedUsername,
        );

      const requesterLabel = _getRequesterLabel(callbackParam);

      const responsePayload: Record<string, string> = {
        status: 'error',
        username: normalizedUsername,
      };

      if (!isLoggedIn || !isKnownAccount) {
        responsePayload.error = 'not_logged_in';
        responsePayload.message = `Username ${normalizedUsername} is not logged in on Ecency.`;
        await _openCallback(callbackParam, requestId, responsePayload);
        return;
      }

      const userData = await _getStoredUserData(normalizedUsername);

      if (!userData) {
        responsePayload.error = 'not_found';
        responsePayload.message = `Username ${normalizedUsername} is not logged in on Ecency.`;
        await _openCallback(callbackParam, requestId, responsePayload);
        return;
      }

      const canProvideKey =
        !!userData.postingKey &&
        (userData.authType === authType.MASTER_KEY || userData.authType === authType.POSTING_KEY);

      if (!canProvideKey) {
        responsePayload.error = 'posting_key_unavailable';
        responsePayload.message = `Username ${normalizedUsername} doesn't have a posting private key stored on Ecency.`;
        await _openCallback(callbackParam, requestId, responsePayload);
        return;
      }

      if (!pinCode) {
        responsePayload.error = 'pin_required';
        responsePayload.message = `Unable to unlock stored keys for ${normalizedUsername}.`;
        await _openCallback(callbackParam, requestId, responsePayload);
        return;
      }

      const digitPinCode = getDigitPinCode(pinCode);
      if (!digitPinCode) {
        responsePayload.error = 'pin_required';
        responsePayload.message = `Unable to unlock stored keys for ${normalizedUsername}.`;
        await _openCallback(callbackParam, requestId, responsePayload);
        return;
      }

      const userConfirmed = await _confirmPostingKeyShare(normalizedUsername, requesterLabel);

      if (!userConfirmed) {
        responsePayload.error = 'user_cancelled';
        responsePayload.message = requesterLabel
          ? `User declined to share the posting private key with ${requesterLabel}.`
          : 'User declined to share the posting private key.';
        await _openCallback(callbackParam, requestId, responsePayload);
        return;
      }

      const postingKey = decryptKey(userData.postingKey, digitPinCode);

      if (!postingKey) {
        responsePayload.error = 'posting_key_unavailable';
        responsePayload.message = `Username ${normalizedUsername} doesn't have a posting private key stored on Ecency.`;
        await _openCallback(callbackParam, requestId, responsePayload);
        return;
      }

      const successPayload: Record<string, string> = {
        status: 'success',
        username: normalizedUsername,
        posting_key: postingKey,
      };

      await _openCallback(callbackParam, requestId, successPayload);
    } catch (error) {
      console.warn('Failed to handle ecency login deeplink', error);
      _showInvalidAlert();
    }
  };

  const handleLink = (deeplink: string) => {
    if (_isEcencyLoginDeeplink(deeplink)) {
      void _handleEcencyLoginDeeplink(deeplink);
      return;
    }

    const normalizedLink = normalizeHiveUri(deeplink);
    if (isHiveUri(normalizedLink)) {
      _handleHiveUri(normalizedLink);
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
