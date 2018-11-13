import React, { Component } from 'react';
import { View } from 'react-native';

// Constants
import { strings } from '../../../config/locales/i18n';

// Utilities
import parseToken from '../../../utils/parseToken';
import parseDate from '../../../utils/parseDate';
import { vestsToSp } from '../../../utils/conversions';

// Components
import { FilterBar } from '../../filterBar';
import { GrayWrapper, WalletLineItem, Card } from '../../basicUIElements';

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

  _getTransactionData = (transaction) => {
    const { walletData } = this.props;
    const result = {};

    // eslint-disable-next-line
    result.opName = transaction[1].op[0];
    const opData = transaction[1].op[1];
    const { timestamp } = transaction[1];

    result.transDate = parseDate(timestamp);
    result.icon = 'local_activity';

    switch (result.opName) {
      case 'curation_reward':
        const { reward } = opData;
        const { comment_author: commentAuthor, comment_permlink: commentPermlink } = opData;

        result.value = `${vestsToSp(parseToken(reward), walletData.steemPerMVests)} SP`;
        result.details = `@${commentAuthor}/${commentPermlink}`;
        break;
      case 'author_reward':
      case 'comment_benefactor_reward':
        let {
          sbd_payout: sbdPayout,
          steem_payout: steemPayout,
          vesting_payout: vestingPayout,
        } = opData;

        const { author, permlink } = opData;

        sbdPayout = parseToken(sbdPayout);
        steemPayout = parseToken(steemPayout);
        vestingPayout = parseToken(vestingPayout);

        result.value = `${sbdPayout > 0 ? `${sbdPayout} SBD` : ''} ${
          steemPayout > 0 ? `${steemPayout} steemPayout` : ''
        } ${vestingPayout > 0 ? `${vestsToSp(vestingPayout, walletData.steemPerMVests)} SP` : ''}`;

        result.details = `@${author}/${permlink}`;
        if (result.opName === 'comment_benefactor_reward') {
          result.icon = 'comment';
        }
        break;
      case 'claim_reward_balance':
        let {
          reward_sbd: rewardSdb,
          reward_steem: rewardSteem,
          reward_vests: rewardVests,
        } = opData;

        rewardSdb = parseToken(rewardSdb);
        rewardSteem = parseToken(rewardSteem);
        rewardVests = parseToken(rewardVests);

        result.value = `${rewardSdb > 0 ? `${rewardSdb} SBD` : ''} ${
          rewardSteem > 0 ? `${rewardSteem} STEEM` : ''
        } ${rewardVests > 0 ? `${vestsToSp(rewardVests, walletData.steemPerMVests)} SP` : ''}`;
        break;
      case 'transfer':
      case 'transfer_to_vesting':
        const {
          amount, memo, from, to,
        } = opData;

        result.value = `${amount}`;
        result.icon = 'compare_arrows';
        // details = <span>{memo} <br/><br/> <strong>@{from}</strong> -&gt; <strong>@{to}</strong></span>;
        break;
      case 'withdraw_vesting':
        const { acc } = opData;
        let { vesting_shares: opVestingShares } = opData;

        opVestingShares = parseToken(opVestingShares);
        result.value = `${vestsToSp(opVestingShares, walletData.steemPerMVests)} SP`;
        result.icon = 'money';
        // details = <span><strong>@{acc}</strong></span>;
        break;
      case 'fill_order':
        const { current_pays: currentPays, open_pays: openPays } = opData;

        result.value = `${currentPays} = ${openPays}`;
        result.icon = 'reorder';
        break;
      default:
        break;
    }
    return result;
  };

  render() {
    const { walletData: { transactions } } = this.props;

    console.log('transactions :', transactions);
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
              const transactionData = this._getTransactionData(item);
              if (index % 2 === 0) {
                return (
                  <WalletLineItem
                    text={strings(`wallet.${transactionData.opName}`)}
                    isCircleIcon
                    isThin
                    circleIconColor="white"
                    textColor="#3c4449"
                    iconName="ios-chatboxes"
                    rightText={transactionData.value}
                    tightTextColor="red"
                  />
                );
              }
              return (
                <GrayWrapper>
                  <WalletLineItem
                    text={strings(`wallet.${transactionData.opName}`)}
                    isCircleIcon
                    isThin
                    circleIconColor="white"
                    textColor="#3c4449"
                    iconName="ios-chatboxes"
                    rightText={transactionData.value}
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
