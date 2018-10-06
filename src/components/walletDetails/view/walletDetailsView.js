import React, { Component } from 'react';
import { View, Text } from 'react-native';

// Constants

// Components
import { GrayWrapper, WalletLineItem } from '../../basicUIElements';
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
    return (
      <View>
        <WalletLineItem
          text="Steem"
          textColor="#3c4449"
          iconName="ios-information-circle-outline"
          rightText="27.178 STEEM"
          isBoldText
        />
        <GrayWrapper>
          <WalletLineItem
            text="Steem"
            textColor="#3c4449"
            iconName="ios-information-circle-outline"
            rightText="27.178 STEEM"
            tightTextColor="red"
            isBoldText
          />

          <WalletLineItem rightText="27.178 STEEM" tightTextColor="red" />
        </GrayWrapper>

        <WalletLineItem
          text="Net power down is in 6 days"
          textColor="#788187"
          iconName="ios-information-circle-outline"
        />
      </View>
    );
  }
}

export default WalletDetailsView;
