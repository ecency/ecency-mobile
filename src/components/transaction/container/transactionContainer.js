import React, { Component } from 'react';

// Component
import TransactionView from '../view/transactionView';

/**
 *            Props Name        Description                                     Value
 * @props --> intl              Function for language support                   function
 * @props --> walletData        User wallet data                                object
 *
 */

class TransactionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { intl, walletData } = this.props;

    return <TransactionView intl={intl} walletData={walletData} />;
  }
}

export default TransactionContainer;
