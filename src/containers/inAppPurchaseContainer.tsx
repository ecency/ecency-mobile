/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Alert, EmitterSubscription } from 'react-native';
import * as IAP from 'react-native-iap';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services
import { useNavigation } from '@react-navigation/native';
import bugsnagInstance from '../config/bugsnag';
import { purchaseOrder } from '../providers/ecency/ecency';

// Utilities
import { default as ROUTES } from '../constants/routeNames';
import { showActionModal } from '../redux/actions/uiAction';
import { UserAvatar } from '../components';
import { PurchaseRequestData } from '../providers/ecency/ecency.types';

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

      this._getItems();
      await this._handleQrPurchase();

      // place rest of unconsumed purhcases in state
      this._getUnconsumedPurchases();
    } catch (err) {
      bugsnagInstance.notify(err);
      console.warn(err.code, err.message);

      Alert.alert(
        intl.formatMessage({
          id: 'alert.connection_issues',
        }),
        err.message,
      );
    }
  };

  // attempt to call purchase order and consumes purchased item on success
  _consumePurchase = async (purchase) => {
    const {
      currentAccount: { name },
      intl,
      fetchData,
      username,
      email,
      handleOnPurchaseFailure,
      handleOnPurchaseSuccess,
    } = this.props;
    const data = {};

    try {
      const receipt = get(purchase, 'transactionReceipt');
      const token = get(purchase, 'purchaseToken');

      if (receipt) {
        const data: PurchaseRequestData = {
          platform: Platform.OS === 'android' ? 'play_store' : 'app_store',
          product: get(purchase, 'productId'),
          receipt: Platform.OS === 'android' ? token : receipt,
          user: username || name, // username from passed in props from nav params i-e got from url qr scan
        };

        // make sure item is not consumed if email and username not preset for 999accounts
        if (purchase.productId === '999accounts' && (!email || !username)) {
          throw new Error('Email and username are required for 999accounts consumption');
        }

        if (email && purchase.productId === '999accounts') {
          console.log('injecting purchase account meta');
          data.user = name || 'ecency'; // if user logged in user that name else use ecency,
          data.meta = {
            username,
            email,
          };
        }

        // purhcase call to ecency on successful payment, consume iap item on success
        await purchaseOrder(data);

        try {
          const ackResult = await IAP.finishTransaction({
            purchase,
            isConsumable: true,
          });
          console.info('ackResult', ackResult);
        } catch (ackErr) {
          console.warn('ackErr', ackErr);
          throw new Error(`consume failed, purchase successfull, ${ackErr.message}`);
        }

        this.setState({ isProcessing: false });

        if (fetchData) {
          fetchData();
        }
        if (handleOnPurchaseSuccess) {
          handleOnPurchaseSuccess();
        }
      }
    } catch (err) {
      this.setState({ isProcessing: false });
      if (handleOnPurchaseFailure) {
        handleOnPurchaseFailure(err);
      }
      this._getUnconsumedPurchases();
      bugsnagInstance.notify(err, (report) => {
        report.addMetadata('data', data);
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
          // consume item using finishTransactionx
          await this._consumePurchase(purchases[i]);
        }
      }
    } catch (err) {
      bugsnagInstance.notify(err);
      console.warn(err.code, err.message);
    }
  };

  // Component Functions
  _purchaseUpdatedListener = () => {
    this.purchaseUpdateSubscription = IAP.purchaseUpdatedListener(this._consumePurchase);

    this.purchaseErrorSubscription = IAP.purchaseErrorListener((error) => {
      const {
        currentAccount: { name },
        intl,
        fetchData,
        username,
        email,
        handleOnPurchaseFailure,
        handleOnPurchaseSuccess,
      } = this.props;

      bugsnagInstance.notify(error);
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
      bugsnagInstance.notify(error);
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
    const { navigation } = this.props;
    const { unconsumedPurchases } = this.state;

    if (sku !== 'freePoints') {
      this.setState({ isProcessing: true });

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
        bugsnagInstance.notify(err, (report) => {
          report.addMetadata('sku', sku);
        });
      }
    } else {
      navigation.navigate({
        name: ROUTES.SCREENS.SPIN_GAME,
      });
    }
  };

  _handleQrPurchase = async () => {
    const { skus, dispatch, intl, route } = this.props;
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

      dispatch(
        showActionModal({
          title,
          body,
          buttons: [
            {
              text: intl.formatMessage({ id: 'alert.cancel' }),
              onPress: () => console.log('Cancel'),
            },
            {
              text: intl.formatMessage({ id: 'alert.confirm' }),
              onPress: async () => await this._buyItem(productId),
            },
          ],
          headerContent: <UserAvatar username={username} size="xl" />,
        }),
      );
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
  currentAccount: state.account.currentAccount,
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  return <InAppPurchaseContainer {...props} navigation={navigation} />;
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
/* eslint-enable */
