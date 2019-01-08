import React, { PureComponent } from 'react';

// Component
import TransactionView from '../view/transactionView';

/**
 *            Props Name        Description                                     Value
 * @props --> intl              Function for language support                   function
 * @props --> walletData        User wallet data                                object
 *
 */

class TransactionContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { walletData } = this.props;

    return <TransactionView walletData={walletData} />;
  }
}

export default TransactionContainer;
