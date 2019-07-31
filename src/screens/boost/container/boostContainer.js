import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Alert } from 'react-native';
import RNIap, { purchaseErrorListener, purchaseUpdatedListener } from 'react-native-iap';
import { injectIntl } from 'react-intl';

// import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
// import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import BoostScreen from '../screen/boostScreen';

const ITEM_SKUS = Platform.select({
  ios: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
  android: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
});

class BoostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productList: [],
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._getItems();
    this._purchaseUpdatedListener();
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
  }

  // Component Functions

  _purchaseUpdatedListener = () => {
    this.purchaseUpdateSubscription = purchaseUpdatedListener(purchase => {
      console.log('purchaseUpdatedListener', purchase);
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        // yourAPI.deliverOrDownloadFancyInAppPurchase(receipt).then(deliveryResult => {
        //   if (Platform.OS === 'ios') {
        //     RNIap.finishTransactionIOS(purchase.transactionId);
        //   } else if (Platform.OS === 'android') {
        //     RNIap.consumePurchaseAndroid(purchase.purchaseToken);
        //   }
        // });
      }
    });

    this.purchaseErrorSubscription = purchaseErrorListener(error => {
      Alert.alert('Warning', error);
    });
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

  render() {
    const { productList } = this.state;

    return <BoostScreen boostData={productList} buyItem={this._buyItem} />;
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(BoostContainer));
