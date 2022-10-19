/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Alert } from 'react-native';
import RNIap, { purchaseErrorListener, purchaseUpdatedListener } from 'react-native-iap';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services
import bugsnagInstance from '../config/bugsnag';
import { purchaseOrder } from '../providers/ecency/ecency';

// Utilities
import { default as ROUTES } from '../constants/routeNames';
import { showActionModal } from '../redux/actions/uiAction';
import { UserAvatar } from '../components';
import { useNavigation } from '@react-navigation/native';

class InAppPurchaseContainer extends Component {
  purchaseUpdateSubscription = null;
  purchaseErrorSubscription = null;

  constructor(props) {
    super(props);
    this.state = {
      productList: [],
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
    RNIap.endConnection();
  }


  _initContainer = async () => {
    const {
      intl,
    } = this.props;
    try {
      await RNIap.initConnection();
      if (Platform.OS === 'android') {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid(); 
      }

      await this._consumeAvailablePurchases()
      this._getItems();
      this._purchaseUpdatedListener();
      await this._handleQrPurchase();
    } catch (err) {
      bugsnagInstance.notify(err);
      console.warn(err.code, err.message);

      Alert.alert(
        intl.formatMessage({
          id: 'alert.connection_issues',
        }),
        err.message
      );
    }
   
  }


  //this snippet consumes all previously bought purchases 
  //that are set to be consumed yet
  _consumeAvailablePurchases = async () => {
    try{
      //get available purchase
      const purchases = await RNIap.getAvailablePurchases();
      //check consumeable status
      for (let i = 0; i < purchases.length; i++) {
        //consume item using finishTransactionx      
        await RNIap.finishTransaction(purchases[i], true);
      }
    }catch(err){
      bugsnagInstance.notify(err);
      console.warn(err.code, err.message);
    }
  }

  
  // Component Functions

  _purchaseUpdatedListener = () => {
    const {
      currentAccount: { name },
      intl,
      fetchData,
      username,
    } = this.props;

    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
      const receipt = get(purchase, 'transactionReceipt');
      const token = get(purchase, 'purchaseToken');

      if (receipt) {
        const data = {
          platform: Platform.OS === 'android' ? 'play_store' : 'app_store',
          product: get(purchase, 'productId'),
          receipt: Platform.OS === 'android' ? token : receipt,
          user: username ? username : name, //username from passed in props from nav params i-e got from url qr scan
        };

        purchaseOrder(data)
          .then(async () => {
            try {
              const ackResult = await RNIap.finishTransaction(purchase, true);
              console.info('ackResult', ackResult);
            } catch (ackErr) {
              console.warn('ackErr', ackErr);
            }

            this.setState({ isProcessing: false });

            if (fetchData) {
              fetchData();
            }
          })
          .catch((err) =>
            bugsnagInstance.notify(err, (report) => {
              report.addMetadata('data', data);
            }),
          );
      }
    });

    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
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
          error.message
        );
      }
      this.setState({ isProcessing: false });
    });
  };

  _getTitle = (title) => {
    let _title = title.toUpperCase();
    if (_title !== 'FREE POINTS') {
      _title = _title.replace(/[^0-9]+/g, '') + ' POINTS';
    }
  
    return _title;
  };

  _getItems = async () => {
    const { skus } = this.props;
    try {
      const products = await RNIap.getProducts(skus);
      console.log(products);
      products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).reverse();
      this.setState({ productList: products });
    } catch (err) {
      bugsnagInstance.notify(err);
      Alert.alert(
          intl.formatMessage({
            id: 'alert.connection_issues',
          }),
          error.message
        );
    }

    this.setState({ isLoading: false });
  };

  _buyItem = async (sku) => {
    const { navigation } = this.props;

    if (sku !== 'freePoints') {
      await this.setState({ isProcessing: true });

      try {
        RNIap.requestPurchase(sku, false);
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
    const { skus, dispatch, intl, route} = this.props as any;
    const products = await RNIap.getProducts(skus);
    const productId = route.param?.productId ?? ''
    const username = route.param?.username ?? ''

    const product:Product = productId && products && products.find((product) => product.productId === productId)
    
    if (product) {

      let body = intl.formatMessage({
         id: 'boost.confirm_purchase_summary' 
        }, {
          points: this._getTitle(product.title),
           username,
           price: `${product.currency} ${product.price}`
          });

          let title = intl.formatMessage({
            id: 'boost.confirm_purchase' 
           }, {
              username,
             });

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
          headerContent: <UserAvatar username={username} size='xl' />,
        }),
      );
    }
  }

  
  render() {
    const { children, isNoSpin, navigation } = this.props;
    const { productList, isLoading, isProcessing } = this.state;
    const FREE_ESTM = { productId: 'freePoints', title: 'free points' };
    const _productList = isNoSpin
      ? productList
      : [...productList.filter((item) => !item.productId.includes('spins')), FREE_ESTM];

    return (
      children &&
      children({
        productList: _productList,
        buyItem: this._buyItem,
        isLoading,
        isProcessing,
        getItems: this._getItems,
        getTitle: this._getTitle,
        spinProduct: productList.filter((item) => item.productId.includes('spins')),
        navigation: navigation
      })
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
});

const mapHooksToProps = (props) => ({
  ...props,
  navigation:useNavigation()
})

export default connect(mapStateToProps)(injectIntl((props)=><InAppPurchaseContainer {...mapHooksToProps(props)}/>));
/* eslint-enable */
