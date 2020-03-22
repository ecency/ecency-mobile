import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

// Constants
import ROUTES from '../../../constants/routeNames';

import { openPinCodeModal } from '../../../redux/actions/applicationActions';

// Component
import WalletDetailsView from '../view/walletDetailsView';

/**
 *            Props Name        Description                                     Value
 * @props --> intl              Function for language support                   function
 * @props --> walletData        User wallet data                                object
 *
 */

class WalletContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions
  _navigate = async (transferType, fundType) => {
    const { dispatch, walletData, isPinCodeOpen, navigation } = this.props;
    let balance;

    switch (fundType) {
      case 'HIVE':
        balance = Math.round(walletData.balance * 1000) / 1000;
        break;
      case 'HBD':
        balance = Math.round(walletData.sbdBalance * 1000) / 1000;
        break;
      case 'SAVING_HIVE':
        balance = Math.round(walletData.savingBalance * 1000) / 1000;
        break;
      case 'SAVING_HBD':
        balance = Math.round(walletData.savingBalanceSbd * 1000) / 1000;
        break;
      default:
        break;
    }

    if (isPinCodeOpen) {
      dispatch(
        openPinCodeModal({
          navigateTo: ROUTES.SCREENS.TRANSFER,
          navigateParams: { transferType, fundType, balance },
        }),
      );
    } else {
      navigation.navigate({
        routeName: ROUTES.SCREENS.TRANSFER,
        params: { transferType, fundType, balance },
      });
    }
  };

  render() {
    const { intl, walletData, isShowDropdowns } = this.props;

    return (
      <WalletDetailsView
        intl={intl}
        walletData={walletData}
        navigate={this._navigate}
        isShowDropdowns={isShowDropdowns}
      />
    );
  }
}

const mapStateToProps = state => ({
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default connect(mapStateToProps)(withNavigation(WalletContainer));
