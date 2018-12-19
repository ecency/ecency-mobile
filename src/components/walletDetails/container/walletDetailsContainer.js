import React, { Component } from 'react';

// Component
import { WalletDetailsView } from '..';

/**
 *            Props Name        Description                                     Value
 * @props --> intl              Function for language support                   function
 * @props --> walletData        User wallet data                                object
 *
 */

class WalletContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { intl, walletData } = this.props;

    return <WalletDetailsView intl={intl} walletData={walletData} />;
  }
}

export default WalletContainer;
