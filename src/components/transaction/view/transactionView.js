import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { FilterBar } from '../../filterBar';
import { GrayWrapper, WalletLineItem, Card } from '../../basicUIElements';
import { CollapsibleCard } from '../../collapsibleCard';

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
    const { transactions } = this.props;
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
          {transactions
            && transactions.map((item, index) => {
              if (index % 2 === 0) {
                return (
                  <WalletLineItem
                    text={item[1].op[0]}
                    description="32 minutes ago"
                    isCircleIcon
                    isThin
                    circleIconColor="white"
                    textColor="#3c4449"
                    iconName="ios-chatboxes"
                    rightText="18,891.867 STEEM"
                    tightTextColor="red"
                  />
                );
              }
              return (
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
              );
            })}
        </Card>
      </View>
    );
  }
}

export default TransactionView;
