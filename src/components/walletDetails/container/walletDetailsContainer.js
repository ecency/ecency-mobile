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
    const { dispatch, walletData } = this.props;
    let balance;

    switch (fundType) {
      case 'STEEM':
        balance = Math.round(walletData.balance * 1000) / 1000;
        break;
      case 'SBD':
        balance = Math.round(walletData.sbdBalance * 1000) / 1000;
        break;
      case 'SAVING_STEEM':
        balance = Math.round(walletData.savingBalance * 1000) / 1000;
        break;
      case 'SAVING_SBD':
        balance = Math.round(walletData.savingBalanceSbd * 1000) / 1000;
        break;
      default:
        break;
    }

    dispatch(
      openPinCodeModal({
        navigateTo: ROUTES.SCREENS.TRANSFER,
        navigateParams: { transferType, fundType, balance },
      }),
    );
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

export default connect()(withNavigation(WalletContainer));
