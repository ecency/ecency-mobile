import React, { Component } from 'react';
import { View } from 'react-native';

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
    const { balance } = this.props;
    return (
      <View>
        <WalletLineItem
          text="Steem"
          textColor="#3c4449"
          iconName="ios-information-circle-outline"
          rightText={balance}
          isBoldText
        />
        <GrayWrapper>
          <WalletLineItem
            text="Steem"
            textColor="#3c4449"
            iconName="ios-information-circle-outline"
            rightText="18,891.867 STEEM"
            tightTextColor="red"
            isBoldText
          />

          <WalletLineItem rightText="- 15,088.108 SP" />
          <WalletLineItem rightText="+ 504,787.529 SP" />
          <WalletLineItem rightText="= 508,591.288 SP" rightTextColor="#357ce6" />
        </GrayWrapper>

        <WalletLineItem
          text="Net power down is in 6 days"
          textColor="#788187"
          isThin
          iconName="ios-information-circle-outline"
        />
      </View>
    );
  }
}

export default WalletDetailsView;
