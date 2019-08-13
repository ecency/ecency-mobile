import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Alert } from 'react-native';
import { withNavigation } from 'react-navigation';
import RNIap, { purchaseErrorListener, purchaseUpdatedListener } from 'react-native-iap';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
// Services
import { purchaseOrder } from '../../../providers/esteem/esteem';
import bugsnag from '../../../config/bugsnag';

// Utilities
import { default as ROUTES } from '../../../constants/routeNames';

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
      isLoading: true,
      isProccesing: false,
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
      intl,
    } = this.props;

    this.purchaseUpdateSubscription = purchaseUpdatedListener(purchase => {
      const receipt = get(purchase, 'transactionReceipt');
      const token = get(purchase, 'purchaseToken');

      if (receipt) {
        const data = {
          platform: Platform.OS === 'android' ? 'play_store' : 'app_store',
          product: get(purchase, 'productId'),
          receipt: Platform.OS === 'android' ? token : receipt,
          user: name,
        };

        purchaseOrder(data)
          .then(() => {
            if (Platform.OS === 'ios') {
              RNIap.finishTransactionIOS(get(purchase, 'transactionId'));
            } else if (Platform.OS === 'android') {
              RNIap.consumePurchaseAndroid(token);
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
      if (get(error, 'responseCode') !== '2') {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.warning',
          }),
          error,
        );
        bugsnag.notify(error);
      }
    });
  };

  _getItems = async () => {
    try {
      const products = await RNIap.getProducts(ITEM_SKUS);

      products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).reverse();
      await this.setState({ productList: products });
    } catch (err) {
      bugsnag.notify(err);
      Alert.alert(
        `Fetching data from server failed, please try again or notify us at info@esteem.app
          ${err.message.substr(0, 20)}`,
      );
    }

    await this.setState({ isLoading: false });
  };

  _buyItem = async sku => {
    const { navigation } = this.props;

    await this.setState({ isProccesing: true });

    if (sku !== 'freePoints') {
      try {
        await RNIap.requestPurchase(sku, false);
      } catch (err) {
        bugsnag.notify(err, report => {
          report.metadata = {
            sku,
          };
        });
      }
    } else {
      navigation.navigate({
        routeName: ROUTES.SCREENS.FREE_ESTM,
      });
    }

    this.setState({ isProccesing: false });
  };

  render() {
    const { productList, isLoading, isProccesing } = this.state;
    // const FREE_ESTM = { productId: 'freePoints', title: 'free estm' };

    return (
      <BoostScreen
        // productList={[...productList, FREE_ESTM]}
        productList={productList}
        buyItem={this._buyItem}
        isLoading={isLoading}
        isProccesing={isProccesing}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default withNavigation(injectIntl(connect(mapStateToProps)(BoostContainer)));
