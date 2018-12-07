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
    const { walletData, intl } = this.props;
    return (
      <View style={styles.container}>
        <WalletLineItem
          text="Steem"
          textColor="#3c4449"
          iconName="ios-information-circle-outline"
          rightText={`${Math.round(walletData.estimatedValue * 1000) / 1000} STEEM`}
          isBoldText
        />
        <GrayWrapper>
          <WalletLineItem
            text={intl.formatMessage({
              id: 'profile.steem_power',
            })}
            textColor="#3c4449"
            iconName="ios-information-circle-outline"
            rightText={`${Math.round(
              vestsToSp(walletData.vestingShares, walletData.steemPerMVests) * 1000,
            ) / 1000} SP`}
            isBoldText
          />

          {walletData.vestingSharesDelegated > 0 && (
            <WalletLineItem
              rightText={`- ${Math.round(
                vestsToSp(walletData.vestingSharesDelegated, walletData.steemPerMVests) * 1000,
              ) / 1000} SP`}
            />
          )}
          {walletData.vestingSharesReceived > 0 && (
            <WalletLineItem
              rightText={`+ ${Math.round(
                vestsToSp(walletData.vestingSharesReceived, walletData.steemPerMVests) * 1000,
              ) / 1000} SP`}
            />
          )}
          {(walletData.vestingSharesDelegated > 0 || walletData.vestingSharesReceived > 0) && (
            <WalletLineItem
              rightText={`= ${Math.round(
                vestsToSp(walletData.vestingSharesTotal, walletData.steemPerMVests) * 1000,
              ) / 1000} SP`}
              rightTextColor="#357ce6"
            />
          )}
        </GrayWrapper>

        <WalletLineItem
          text={intl.formatMessage({
            id: 'profile.steem_dollars',
          })}
          textColor="#3c4449"
          iconName="ios-information-circle-outline"
          rightText={`$${Math.round(walletData.sbdBalance * 1000) / 1000}`}
          isBoldText
        />
        <GrayWrapper>
          <WalletLineItem
            text={intl.formatMessage({
              id: 'profile.savings',
            })}
            textColor="#3c4449"
            iconName="ios-information-circle-outline"
            rightText={`${Math.round(walletData.savingBalance * 1000) / 1000} STEEM`}
            isBoldText
          />
          <WalletLineItem rightText={`$${Math.round(walletData.savingBalanceSbd * 1000) / 1000}`} />
        </GrayWrapper>
        {walletData.showPowerDown && (
          <WalletLineItem
            text={`Next power down is in ${walletData.nextVestingWithdrawal} day`}
            textColor="#788187"
            iconName="ios-information-circle-outline"
          />
        )}
      </View>
    );
  }
}

export default WalletDetailsView;
