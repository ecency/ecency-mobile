import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Alert, EmitterSubscription } from 'react-native';
import * as IAP from 'react-native-iap';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import { useNavigation } from '@react-navigation/native';
import { SheetManager } from 'react-native-actions-sheet';
import * as Sentry from '@sentry/react-native';
import { selectCurrentAccount, selectIsLoggedIn } from '../redux/selectors';
import { purchaseOrder } from '../providers/ecency/ecency';

// Utilities
import { default as ROUTES } from '../constants/routeNames';
import { UserAvatar } from '../components';
import { PurchaseRequestData } from '../providers/ecency/ecency.types';
import { SheetNames } from '../navigation/sheets';

// Username/email entered when a paid-account purchase is started. Persisted so a
// purchase that Google has charged but that was not finalized (network drop, app
// killed, or the purchase listener firing without the registration screen
// mounted) can still be completed later -- otherwise Google auto-refunds any
// purchase that is not acknowledged within 3 days.
const PENDING_ACCOUNT_PURCHASE_KEY = 'pendingAccountPurchaseMeta';
const PURCHASE_ORDER_MAX_ATTEMPTS = 3;

class InAppPurchaseContainer extends Component {
  purchaseUpdateSubscription: EmitterSubscription | null = null;

  purchaseErrorSubscription: EmitterSubscription | null = null;

  constructor(props) {
    super(props);
    this.state = {
      productList: [],
      unconsumedPurchases: [],
      isLoading: true,
      isProcessing: false,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._initContainer();
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }

    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
    IAP.endConnection();
  }

  _initContainer = async () => {
    const { intl, disablePurchaseListenerOnMount } = this.props;
    try {
      await IAP.initConnection();
      if (Platform.OS === 'android') {
        await IAP.flushFailedPurchasesCachedAsPendingAndroid();
      }

      if (!disablePurchaseListenerOnMount) {
        await this._consumeAvailablePurchases();
        this._purchaseUpdatedListener();
      }

      await this._getItems();
      await this._handleQrPurchase();

      // place rest of unconsumed purhcases in state
      this._getUnconsumedPurchases();
    } catch (err) {
      Sentry.captureException(err);
      console.warn(err.code, err.message);

      Alert.alert(
        intl.formatMessage({
          id: 'alert.connection_issues',
        }),
        err.message,
      );
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // Resolve the account meta (username/email/referral) for a 999accounts purchase
  // from props (registration screen) or, as a fallback, from the persisted
  // context saved at buy time. Returns null when neither is available.
  _resolveAccountMeta = async () => {
    const { username, email, referral } = this.props;
    if (username && email) {
      return { username, email, referral: referral || '' };
    }
    try {
      const raw = await AsyncStorage.getItem(PENDING_ACCOUNT_PURCHASE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
    return null;
  };

  // Post the purchase to ecency, retrying transient failures with backoff so a
  // dropped network call does not leave a paid purchase unregistered (and later
  // auto-refunded by Google).
  _purchaseOrderWithRetry = async (data) => {
    let lastErr;
    for (let attempt = 0; attempt < PURCHASE_ORDER_MAX_ATTEMPTS; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await purchaseOrder(data);
      } catch (err) {
        // 409 means the receipt is already recorded server-side (duplicate) --
        // effectively success. Stop retrying so the purchase can be finalized and
        // the saved context cleared, instead of looping on every launch.
        if (get(err, 'response.status') === 409) {
          return undefined;
        }
        lastErr = err;
        // Don't sleep after the final attempt -- there is nothing left to retry.
        if (attempt < PURCHASE_ORDER_MAX_ATTEMPTS - 1) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
        }
      }
    }
    throw lastErr;
  };

  // attempt to call purchase order and consumes purchased item on success.
  // opts.silent suppresses the success/failure UI callbacks (used for background
  // recovery of an interrupted purchase on a screen unrelated to that purchase).
  _consumePurchase = async (purchase, opts = {}) => {
    const { silent, meta: providedMeta } = opts;
    const {
      currentAccount: { name },
      fetchData,
      handleOnPurchaseFailure,
      handleOnPurchaseSuccess,
    } = this.props;
    const data = {};

    try {
      const receipt = get(purchase, 'transactionReceipt');
      const token = get(purchase, 'purchaseToken');

      if (receipt) {
        const isAccount = purchase.productId === '999accounts';
        const data: PurchaseRequestData = {
          platform: Platform.OS === 'android' ? 'play_store' : 'app_store',
          product: get(purchase, 'productId'),
          receipt: Platform.OS === 'android' ? token : receipt,
          user: this.props.username || name, // from nav params i-e got from url qr scan
        };

        if (isAccount) {
          // 999accounts needs username/email; use the meta the caller already
          // resolved (recovery path) or resolve from props/persisted context.
          // Without it we cannot create the account, so leave the purchase
          // unconsumed for a later retry rather than consuming it.
          const meta = providedMeta || (await this._resolveAccountMeta());
          if (!meta || !meta.username || !meta.email) {
            throw new Error('Email and username are required for 999accounts consumption');
          }
          data.user = name || 'ecency'; // if user logged in use that name else use ecency
          data.meta = {
            username: meta.username,
            email: meta.email,
            referral: meta.referral || '',
          };
        }

        // purchase call to ecency on successful payment, consume iap item on success
        await this._purchaseOrderWithRetry(data);

        if (isAccount) {
          // The order is now recorded server-side (the account will be created and
          // the purchase is acknowledged server-side), so the saved context is no
          // longer needed. Clear it here -- NOT gated on the consume below -- so a
          // permanently failing finishTransaction can't keep re-running recovery
          // every launch (a re-POST of the same receipt just returns 409).
          try {
            await AsyncStorage.removeItem(PENDING_ACCOUNT_PURCHASE_KEY);
          } catch (err) {
            Sentry.captureException(err);
          }
        }

        // Entitlement is granted and acknowledged server-side, so a failed consume
        // here is NOT fatal -- it can be retried on a later launch and must not be
        // surfaced as a purchase failure.
        try {
          const ackResult = await IAP.finishTransaction({
            purchase,
            isConsumable: true,
          });
          console.info('ackResult', ackResult);
        } catch (ackErr) {
          console.warn('finishTransaction failed (non-fatal):', ackErr);
          Sentry.captureException(ackErr);
        }

        this.setState({ isProcessing: false });

        if (!silent && fetchData) {
          fetchData();
        }
        if (!silent && handleOnPurchaseSuccess) {
          handleOnPurchaseSuccess();
        }
      }
    } catch (err) {
      this.setState({ isProcessing: false });
      if (!silent && handleOnPurchaseFailure) {
        handleOnPurchaseFailure(err);
      }
      this._getUnconsumedPurchases();
      Sentry.captureException(err, (scope) => {
        scope.setContext('data', data);
      });
    }
  };

  // this snippet consumes all previously bought purchases
  // that are set to be consumed yet
  _consumeAvailablePurchases = async () => {
    try {
      // get available purchase
      const purchases = await IAP.getAvailablePurchases();
      // check consumeable status
      for (let i = 0; i < purchases.length; i++) {
        const _purchase = purchases[i];

        if (_purchase.productId !== '999accounts') {
          // consume item using finishTransaction
          // eslint-disable-next-line no-await-in-loop
          await this._consumePurchase(_purchase);
        } else {
          // A paid-account purchase that was charged but never finalized. Recover
          // it silently using the saved registration context so the user gets the
          // account (and we are not auto-refunded). Skip if there is no saved
          // context -- the user must reopen registration to provide username/email.
          // eslint-disable-next-line no-await-in-loop
          const meta = await this._resolveAccountMeta();
          if (meta && meta.username && meta.email) {
            // eslint-disable-next-line no-await-in-loop
            await this._consumePurchase(_purchase, { silent: true, meta });
          }
        }
      }
    } catch (err) {
      Sentry.captureException(err);
      console.warn(err.code, err.message);
    }
  };

  // Component Functions
  _purchaseUpdatedListener = () => {
    this.purchaseUpdateSubscription = IAP.purchaseUpdatedListener(this._consumePurchase);

    this.purchaseErrorSubscription = IAP.purchaseErrorListener((error) => {
      // A terminal payment error (user cancelled, declined, etc.) means there is
      // no purchase to recover -- drop any persisted account context so it does
      // not linger in storage until the next purchase overwrites it.
      AsyncStorage.removeItem(PENDING_ACCOUNT_PURCHASE_KEY).catch(() => {});

      const { intl, handleOnPurchaseFailure } = this.props;

      Sentry.captureException(error);
      if (get(error, 'responseCode') === '3' && Platform.OS === 'android') {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.warning',
          }),
          intl.formatMessage({
            id: 'alert.google_play_version',
          }),
        );
      } else if (get(error, 'responseCode') !== '2') {
        console.warn('failed puchase:', error);
        Alert.alert(
          intl.formatMessage({
            id: 'alert.warning',
          }),
          error.message,
        );
      }
      this.setState({ isProcessing: false });
      if (handleOnPurchaseFailure) {
        handleOnPurchaseFailure(error);
      }
    });
  };

  _getTitle = (title) => {
    let _title = title.toUpperCase();
    if (_title !== 'FREE POINTS') {
      _title = `${_title.replace(/[^0-9]+/g, '')} POINTS`;
    }

    return _title;
  };

  _getUnconsumedPurchases = async () => {
    const _purchases = await IAP.getAvailablePurchases();
    this.setState({
      unconsumedPurchases: _purchases,
    });
  };

  _getItems = async () => {
    const { skus, intl } = this.props;
    try {
      const products = await IAP.getProducts({ skus });
      console.log(products);
      products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).reverse();
      this.setState({ productList: products });
    } catch (error) {
      Sentry.captureException(error);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.connection_issues',
        }),
        error.message,
      );
    }

    this.setState({ isLoading: false });
  };

  _buyItem = async (sku) => {
    const { navigation, isLoggedIn, intl, username, email, referral } = this.props;
    const { unconsumedPurchases } = this.state;
    // if user is not loggedIn and purchase is other than account purchase
    // add more skus here for account purchase
    if (!isLoggedIn && sku !== '999accounts') {
      Alert.alert(
        intl.formatMessage({ id: 'login.not_loggedin_alert' }),
        intl.formatMessage({ id: 'login.not_loggedin_alert_desc' }),
      );
      return;
    }

    if (sku !== 'freePoints') {
      this.setState({ isProcessing: true });

      // Persist the registration context up front so an account purchase that is
      // interrupted after payment can be recovered later (see _consumePurchase /
      // _consumeAvailablePurchases) instead of being auto-refunded by Google.
      if (sku === '999accounts' && username && email) {
        try {
          await AsyncStorage.setItem(
            PENDING_ACCOUNT_PURCHASE_KEY,
            JSON.stringify({ username, email, referral: referral || '' }),
          );
        } catch (err) {
          Sentry.captureException(err);
        }
      }

      // check if sku preset in unconsumedItems
      const _unconsumedPurchase = unconsumedPurchases.find((p) => p.productId === sku);
      if (_unconsumedPurchase) {
        this._consumePurchase(_unconsumedPurchase);
        return;
      }

      // chech purhcase listener
      if (!this.purchaseUpdateSubscription || !this.purchaseErrorSubscription) {
        this._purchaseUpdatedListener();
      }

      try {
        IAP.requestPurchase(Platform.OS === 'ios' ? { sku } : { skus: [sku] });
      } catch (err) {
        Sentry.captureException(err, (scope) => {
          scope.setContext('sku', { sku });
        });
      }
    } else {
      navigation.navigate({
        name: ROUTES.SCREENS.SPIN_GAME,
      });
    }
  };

  _handleQrPurchase = async () => {
    const { skus, intl, route } = this.props;
    const products = await IAP.getProducts({ skus });
    const productId = route?.param?.productId ?? '';
    const username = route?.param?.username ?? '';

    const product: IAP.Product =
      productId && products && products.find((product) => product.productId === productId);

    if (product) {
      const body = intl.formatMessage(
        {
          id: 'boost.confirm_purchase_summary',
        },
        {
          points: this._getTitle(product.title),
          username,
          price: `${product.currency} ${product.price}`,
        },
      );

      const title = intl.formatMessage(
        {
          id: 'boost.confirm_purchase',
        },
        {
          username,
        },
      );

      SheetManager.show(SheetNames.ACTION_MODAL, {
        payload: {
          title,
          body,
          buttons: [
            {
              text: intl.formatMessage({ id: 'alert.cancel' }),
              onPress: () => console.log('Cancel'),
            },
            {
              text: intl.formatMessage({ id: 'alert.confirm' }),
              onPress: async () => this._buyItem(productId),
            },
          ],
          headerContent: <UserAvatar username={username} size="xl" />,
        },
      });
    }
  };

  render() {
    const { children, isNoSpin, navigation } = this.props;
    const { productList, isLoading, isProcessing, unconsumedPurchases } = this.state;
    const FREE_ESTM = { productId: 'freePoints', title: 'free points' };
    const _productList = isNoSpin
      ? productList
      : [...productList.filter((item) => !item.productId.includes('spins')), FREE_ESTM];

    return (
      children &&
      children({
        productList: _productList,
        unconsumedPurchases,
        buyItem: this._buyItem,
        isLoading,
        isProcessing,
        getItems: this._getItems,
        getTitle: this._getTitle,
        spinProduct: productList.filter((item) => item.productId.includes('spins')),
        navigation,
      })
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccount: selectCurrentAccount(state),
  isLoggedIn: selectIsLoggedIn(state),
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  return <InAppPurchaseContainer {...props} navigation={navigation} />;
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
