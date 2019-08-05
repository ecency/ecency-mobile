import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Alert } from 'react-native';
import RNIap, { purchaseErrorListener, purchaseUpdatedListener } from 'react-native-iap';
import { injectIntl } from 'react-intl';

// Services
import { purchaseOrder } from '../../../providers/esteem/esteem';
import bugsnag from '../../../config/bugsnag';

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
    const {
      currentAccount: { name },
    } = this.props;

    this.purchaseUpdateSubscription = purchaseUpdatedListener(purchase => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        const data = {
          platform: Platform.OS === 'android' ? 'play_store' : 'app_store',
          product: purchase.productId,
          receipt: Platform.OS === 'android' ? purchase.purchaseToken : purchase.transactionReceipt,
          user: name,
        };

        purchaseOrder(data)
          .then(() => {
            if (Platform.OS === 'ios') {
              RNIap.finishTransactionIOS(purchase.transactionId);
            } else if (Platform.OS === 'android') {
              RNIap.consumePurchaseAndroid(purchase.purchaseToken);
            }
          })
          .catch(err =>
            bugsnag.notify(err, report => {
              report.metadata = {
                data,
              };
            }),
          );
      }
    });

    this.purchaseErrorSubscription = purchaseErrorListener(error => {
      Alert.alert('Warning', error);
    });
  };

  _getItems = async () => {
    try {
      const products = await RNIap.getProducts(ITEM_SKUS);
      products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).reverse();
      this.setState({ productList: products });
    } catch (err) {
      bugsnag.notify(err);
    }
  };

  _buyItem = async sku => {
    try {
      RNIap.requestPurchase(sku, false);
    } catch (err) {
      bugsnag.notify(err, report => {
        report.metadata = {
          sku,
        };
      });
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
