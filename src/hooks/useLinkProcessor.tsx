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

  const _isEcencyTransferDeeplink = (deeplink: string) => {
    try {
      const parsedUrl = new URL(deeplink);
      return (
        parsedUrl.protocol.toLowerCase() === 'ecency:' &&
        parsedUrl.hostname.toLowerCase() === 'transfer'
      );
    } catch (err) {
      return false;
    }
  };

  type EcencyTransferParams = {
    to: string;
    from: string;
    asset: string;
    amount: string;
    memo: string;
    callback?: string;
    requestId?: string | null;
  };

  type HiveUriHandlingOptions = {
    callbackUrl?: string;
    requestId?: string | null;
  };

  const _parseEcencyTransferDeeplink = (deeplink: string): EcencyTransferParams | null => {
    try {
      const transferUrl = new URL(deeplink);
      const toParam = transferUrl.searchParams.get('to') || '';
      const fromParam = transferUrl.searchParams.get('from') || '';
      const assetParam = transferUrl.searchParams.get('asset') || '';
      const amountParam = transferUrl.searchParams.get('amount') || '';
      const memoParam = transferUrl.searchParams.get('memo') || '';
      const callbackParam = transferUrl.searchParams.get('callback') || undefined;
      const requestIdParam = transferUrl.searchParams.get('request_id');

      return {
        to: toParam,
        from: fromParam,
        asset: assetParam,
        amount: amountParam,
        memo: memoParam,
        callback: callbackParam,
        requestId: requestIdParam,
      };
    } catch (error) {
      console.warn('Failed to parse ecency transfer deeplink', error);
      return null;
    }
  };

  const _buildEcencyTransferHiveUri = (
    params: EcencyTransferParams,
  ): { hiveUri: string | null; normalizedFrom?: string } => {
    const { to, from, asset, amount, memo, callback } = params;

    const normalizedTo = to.replace(/^@/, '').trim();
    const normalizedFrom = from.replace(/^@/, '').trim();
    const parsedAmount = parseFloat(amount);
    if (!normalizedTo || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return { hiveUri: null };
    }

    const formattedAmount = parsedAmount.toFixed(3);
    const lowerCaseAsset = asset.trim().toLowerCase();

    try {
      if (lowerCaseAsset === 'points') {
        const hiveUriOptions = callback ? { callback } : undefined;
        const hiveUri = hiveuri.encodeOps(
          [
            [
              'custom_json',
              {
                required_auths: [normalizedFrom || '__signer'],
                required_posting_auths: [],
                id: 'ecency_point_transfer',
                json: JSON.stringify({
                  sender: normalizedFrom || '__signer',
                  receiver: normalizedTo,
                  amount: `${formattedAmount} POINT`,
                  memo,
                }),
              },
            ],
          ],
          hiveUriOptions,
        );

        return { hiveUri, normalizedFrom: normalizedFrom || undefined };
      }

      const assetSymbol = lowerCaseAsset.toUpperCase();
      if (assetSymbol === 'HIVE' || assetSymbol === 'HBD') {
        const hiveUriOptions = callback ? { callback } : undefined;
        const hiveUri = hiveuri.encodeOps(
          [
            [
              'transfer',
              {
                from: normalizedFrom || '__signer',
                to: normalizedTo,
                amount: `${formattedAmount} ${assetSymbol}`,
                memo,
              },
            ],
          ],
          hiveUriOptions,
        );

        return { hiveUri, normalizedFrom: normalizedFrom || undefined };
      }
    } catch (error) {
      console.warn('Failed to build hive uri for ecency transfer', error);
      return { hiveUri: null };
    }

    return { hiveUri: null };
  };

  const _handleEcencyTransferDeeplink = async (deeplink: string) => {
    const transferParams = _parseEcencyTransferDeeplink(deeplink);
    const callbackUrl = transferParams?.callback;
    const requestId = transferParams?.requestId || null;

    if (!transferParams || !transferParams.to || !transferParams.asset || !transferParams.amount) {
      if (callbackUrl) {
        await _openCallback(callbackUrl, requestId, {
          status: 'error',
          error: 'invalid_params',
        });
      }
      _showInvalidAlert();
      return;
    }

    const { hiveUri, normalizedFrom } = _buildEcencyTransferHiveUri(transferParams);

    if (!hiveUri) {
      if (callbackUrl) {
        await _openCallback(callbackUrl, requestId, {
          status: 'error',
          error: 'invalid_params',
        });
      }
      _showInvalidAlert();
      return;
    }

    if (normalizedFrom) {
      const normalizedCurrentAccount = (currentAccount?.name || '').toLowerCase();
      if (normalizedCurrentAccount && normalizedFrom.toLowerCase() !== normalizedCurrentAccount) {
        if (callbackUrl) {
          await _openCallback(callbackUrl, requestId, {
            status: 'error',
            error: 'account_mismatch',
          });
        }
        _showInvalidAlert();
        return;
      }
    }

    _handleHiveUri(hiveUri, {
      callbackUrl,
      requestId,
    });
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

      const parsedCallbackUrl = callbackUrl.toString();

      let canOpenUrl = true;

      try {
        canOpenUrl = await Linking.canOpenURL(parsedCallbackUrl);
      } catch (error) {
        console.warn('Unable to verify callback url support', parsedCallbackUrl, error);
      }

      if (!canOpenUrl) {
        console.warn('Callback url is not supported on this device', parsedCallbackUrl);
      }

      await Linking.openURL(parsedCallbackUrl);
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
        responsePayload.message = [
          'Username ',
          normalizedUsername,
          " doesn't have a posting private key stored on Ecency.",
        ].join('');
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
        responsePayload.message = [
          'Username ',
          normalizedUsername,
          " doesn't have a posting private key stored on Ecency.",
        ].join('');
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
      _handleEcencyLoginDeeplink(deeplink);
      return;
    }

    if (_isEcencyTransferDeeplink(deeplink)) {
      _handleEcencyTransferDeeplink(deeplink);
      return;
    }

    const normalizedLink = normalizeHiveUri(deeplink);
    if (isHiveUri(normalizedLink)) {
      _handleHiveUri(normalizedLink);
    } else {
      _handleDeepLink(deeplink);
    }
  };

  const _handleHiveUri = async (uri: string, options?: HiveUriHandlingOptions) => {
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
            callback: () => _handleHiveUriTransaction(uri, options),
          },
        });
      } else {
        _handleHiveUriTransaction(uri, options);
      }
    } catch (err) {
      _showInvalidAlert();
    }
  };

  const _handleHiveUriTransaction = async (uri: string, options?: HiveUriHandlingOptions) => {
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
    const firstOperation = get(parsed, 'tx.operations[0]', []);
    const isEcencyPointTransfer =
      Array.isArray(firstOperation) &&
      firstOperation.length >= 2 &&
      firstOperation[0] === 'custom_json' &&
      get(firstOperation, '[1].id') === 'ecency_point_transfer';
    const authoritiesMap = new Map();
    authoritiesMap.set('active', !!currentAccount?.local?.activeKey);
    authoritiesMap.set(
      'posting',
      !!currentAccount?.local?.postingKey ||
        (isEcencyPointTransfer && !!currentAccount?.local?.activeKey),
    );
    authoritiesMap.set('owner', !!currentAccount?.local?.ownerKey);
    authoritiesMap.set('memo', !!currentAccount?.local?.memoKey);

    getFormattedTx(parsed.tx, authoritiesMap)
      .then(async (formattedTx) => {
        const tx = await resolveTransaction(formattedTx.tx, parsed.params, currentAccount.name);
        if (isEcencyPointTransfer) {
          const signerName = currentAccount?.name;
          if (signerName) {
            tx.operations = tx.operations.map((operation: any) => {
              if (!Array.isArray(operation) || operation.length < 2) {
                return operation;
              }
              const [operationName, operationPayload] = operation;
              if (operationPayload && typeof operationPayload === 'object') {
                Object.keys(operationPayload).forEach((key) => {
                  if (operationPayload[key] === '__signer') {
                    operationPayload[key] = signerName;
                  }
                });
              }
              if (operationName === 'custom_json' && operationPayload?.json) {
                try {
                  const parsedJson = JSON.parse(operationPayload.json);
                  Object.keys(parsedJson).forEach((key) => {
                    if (parsedJson[key] === '__signer') {
                      parsedJson[key] = signerName;
                    }
                  });
                  operationPayload.json = JSON.stringify(parsedJson);
                } catch (jsonError) {
                  console.warn('Failed to normalize ecency point transfer payload', jsonError);
                }
              }
              return [operationName, operationPayload];
            });
          }
        }
        const ops = get(tx, 'operations', []);
        const op = ops[0];
        SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'qr.confirmTransaction' }),
            bodyContent: _renderActionModalBody(op, formattedTx.opName),
            buttons: [
              {
                text: intl.formatMessage({ id: 'qr.cancel' }),
                onPress: () => {
                  if (options?.callbackUrl || parsed.params?.callback) {
                    _openCallback(
                      options?.callbackUrl || parsed.params?.callback,
                      options?.requestId || parsed.params?.request_id || null,
                      {
                        status: 'error',
                        error: 'user_cancelled',
                      },
                    );
                  }
                },
                style: 'cancel',
              },
              {
                text: intl.formatMessage({ id: 'qr.approve' }),
                onPress: () => {
                  handleHiveUriOperation(currentAccount, pinCode, tx)
                    .then((result) => {
                      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
                      if (options?.callbackUrl || parsed.params?.callback) {
                        const payload: Record<string, string> = { status: 'success' };
                        if (result?.id) {
                          payload.id = `${result.id}`;
                        }
                        _openCallback(
                          options?.callbackUrl || parsed.params?.callback,
                          options?.requestId || parsed.params?.request_id || null,
                          payload,
                        );
                      }
                    })
                    .catch((err) => {
                      if (err) {
                        dispatch(toastNotification(intl.formatMessage({ id: err })));
                      } else {
                        dispatch(
                          toastNotification(intl.formatMessage({ id: 'qr.transaction_failed' })),
                        );
                      }
                      if (options?.callbackUrl || parsed.params?.callback) {
                        _openCallback(
                          options?.callbackUrl || parsed.params?.callback,
                          options?.requestId || parsed.params?.request_id || null,
                          {
                            status: 'error',
                            error: typeof err === 'string' ? err : 'qr.transaction_failed',
                          },
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
