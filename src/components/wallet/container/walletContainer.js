import React, { Component } from 'react';
import { connect } from 'react-redux';

// Utils
import { groomingWalletData } from '../../../utils/wallet';

// Component
import WalletView from '../view/walletView';

/*
 *            Props Name               Description            Value
 * @props -->  currentAccountUsername   description here      Value Type Here
 @ props -->   selectedUsername
 @ props -->   walletData
 *
 */

class WalletContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletData: null,
    };
  }

  async componentDidMount() {
    const { selectedUser } = this.props;
    const walletData = await groomingWalletData(selectedUser);

    this.setState({ walletData });
  }

  render() {
    const { currentAccountUsername, selectedUser, intl } = this.props;
    const { walletData } = this.state;

    return (
      <WalletView
        currentAccountUsername={currentAccountUsername}
        selectedUsername={selectedUser && selectedUser.name}
        walletData={walletData}
        intl={intl}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccountUsername: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(WalletContainer);
