import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';

// Constants
import ROUTES from '../../../constants/routeNames';

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
  _navigate = () => {
    const { navigation } = this.props;
    console.log('navigation :', navigation);
    navigation.navigate({
      routeName: ROUTES.SCREENS.TRANSFER,
    });
  };

  render() {
    const { intl, walletData } = this.props;

    return <WalletDetailsView intl={intl} walletData={walletData} navigate={this._navigate} />;
  }
}

export default withNavigation(WalletContainer);
