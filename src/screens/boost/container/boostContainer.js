import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform } from 'react-native';
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

class BoostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions
  async componentDidMount() {
    try {
      const itemSkus = Platform.select({
        ios: ['app.esteem.mobile.ios.099_points'],
        android: ['com.example.099points'],
      });
      // await RNIap.prepare();
      const products = await RNIap.getProducts([
        '099points',
        '199points',
        '499points',
        '999points',
        '4999points',
        '9999points',
      ]);
      // this.setState({ items });
      console.log(products);
    } catch (err) {
      console.warn(err);
    }

    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase: ProductPurchase) => {
      console.log('purchaseUpdatedListener', purchase);
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        alert('done');
      }
    });

    this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.warn('purchaseErrorListener', error);
    });
  }

  // Component Functions

  _purchase = async sku => {
    try {
      await RNIap.requestPurchase('099points', false);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  render() {
    return <BoostScreen purchase={this._purchase} />;
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(BoostContainer));
