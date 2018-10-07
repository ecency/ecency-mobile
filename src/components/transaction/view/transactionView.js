import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { FilterBar } from '../../filterBar';
import { GrayWrapper, WalletLineItem } from '../../basicUIElements';
import { Card } from '../../basicUIElements';
// Styles
// eslint-disable-next-line
import styles from './transactionStyles';

class TransactionView extends Component {
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
  _handleOnDropdownSelect = () => {};

  render() {
    // eslint-disable-next-line
    // const {} = this.props;

    // eslint-disable-next-line
    return (
      <View>
        <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={['ALL TRANSACTIONS', 'VOTES', 'REPLIES']}
          defaultText="ALL TRANSACTIONS"
          onDropdownSelect={() => this._handleOnDropdownSelect()}
          rightIconName="ios-lock"
          iconSize={16}
        />
        <Card>
          <WalletLineItem
            text="Steem"
            isCircleIcon
            isThin
            textColor="#3c4449"
            iconName="md-star"
            rightText="27.178 STEEM"
          />
          <GrayWrapper>
            <WalletLineItem
              text="Comment Benefactor Reward"
              description="32 minutes ago"
              isCircleIcon
              isThin
              circleIconColor="white"
              textColor="#3c4449"
              iconName="ios-chatboxes"
              rightText="18,891.867 STEEM"
              tightTextColor="red"
            />
          </GrayWrapper>
          <WalletLineItem
            text="Steem"
            isCircleIcon
            isThin
            textColor="#3c4449"
            iconName="md-star"
            rightText="27.178 STEEM"
          />
          <WalletLineItem
            text="@barbara-orenya / recycled-items-embellishments-recyclage-pour-decoration-poetique-eng-fr-901b24da0394fest"
            isThin
            textColor="#3c4449"
          />
        </Card>
      </View>
    );
  }
}

export default TransactionView;
