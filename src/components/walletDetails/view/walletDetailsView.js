import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { GrayWrapper, WalletLineItem } from '../../basicUIElements';

// Utilities
import { vestsToSp } from '../../../utils/conversions';

// Styles
// eslint-disable-next-line
import styles from './walletDetailsStyles';

class WalletDetailsView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { walletData } = this.props;

    return (
      <View>
        <WalletLineItem
          text="Steem"
          textColor="#3c4449"
          iconName="ios-information-circle-outline"
          rightText={`${walletData.estimatedValue} STEEM`}
          isBoldText
        />
        <GrayWrapper>
          <WalletLineItem
            text="Steem Power"
            textColor="#3c4449"
            iconName="ios-information-circle-outline"
            rightText={`${vestsToSp(walletData.vestingShares, walletData.steemPerMVests)} SP`}
            tightTextColor="red"
            isBoldText
          />

          {walletData.vestingSharesDelegated > 0 && (
            <WalletLineItem
              rightText={`- ${vestsToSp(
                walletData.vestingSharesDelegated,
                walletData.steemPerMVests,
              )} SP`}
            />
          )}
          {walletData.vestingSharesReceived > 0 && (
            <WalletLineItem
              rightText={`+ ${vestsToSp(
                walletData.vestingSharesReceived,
                walletData.steemPerMVests,
              )} SP`}
            />
          )}
          {(walletData.vestingSharesDelegated > 0 || walletData.vestingSharesReceived > 0) && (
            <WalletLineItem
              rightText={`= ${vestsToSp(
                walletData.vestingSharesTotal,
                walletData.steemPerMVests,
              )} SP`}
              rightTextColor="#357ce6"
            />
          )}
        </GrayWrapper>

        <WalletLineItem
          text="Steem Dollars"
          textColor="#3c4449"
          iconName="ios-information-circle-outline"
          rightText={`$${walletData.sbdBalance}`}
          isBoldText
        />
        <GrayWrapper>
          <WalletLineItem
            text="Savings"
            textColor="#3c4449"
            iconName="ios-information-circle-outline"
            rightText={`${walletData.savingBalance} STEEM`}
            isBoldText
          />
          <WalletLineItem rightText={`$${walletData.savingBalanceSbd}`} />
        </GrayWrapper>
      </View>
    );
  }
}

export default WalletDetailsView;
