import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Alert } from 'react-native';
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
  ProductPurchase,
  PurchaseError,
} from 'react-native-iap';
// import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
// import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import BoostScreen from '../screen/boostScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const ITEM_SKUS = Platform.select({
  ios: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
  android: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
});

class BoostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receipt: '',
      productList: [],
    };
  }

  // Component Life Cycle Functions

  // Component Functions
  async componentDidMount() {
    this._getItems();
  }

  _getAvailablePurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.info('Available purchases :: ', purchases);
      if (purchases && purchases.length > 0) {
        this.setState({
          receipt: purchases[0].transactionReceipt,
        });
      }
    } catch (err) {
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  };

  _getItems = async () => {
    try {
      const products = await RNIap.getProducts(ITEM_SKUS);
      console.log('Products', products);
      products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).reverse();
      this.setState({ productList: products });
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  _buyItem = async sku => {
    try {
      RNIap.requestPurchase(sku);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  // _buyItem = async sku => {
  //   console.info('buyItem', sku);
  //   // const purchase = await RNIap.buyProduct(sku);
  //   // const products = await RNIap.buySubscription(sku);
  //   // const purchase = await RNIap.buyProductWithoutFinishTransaction(sku);
  //   try {
  //     const purchase = await RNIap.buyProduct(sku);
  //     // console.log('purchase', purchase);
  //     // await RNIap.consumePurchaseAndroid(purchase.purchaseToken);
  //     this.setState({ receipt: purchase.transactionReceipt }, () => this.goNext());
  //   } catch (err) {
  //     console.warn(err.code, err.message);
  //     const subscription = RNIap.addAdditionalSuccessPurchaseListenerIOS(async purchase => {
  //       this.setState({ receipt: purchase.transactionReceipt }, () => this.goNext());
  //       subscription.remove();
  //     });
  //   }
  // };

  render() {
    const { productList } = this.state;

    return <BoostScreen boostData={productList} buyItem={this._buyItem} />;
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(BoostContainer));
