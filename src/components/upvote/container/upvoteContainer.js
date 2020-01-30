import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Realm
import { setUpvotePercent } from '../../../realm/realm';

// Services and Actions
import { setUpvotePercent as upvoteAction } from '../../../redux/actions/applicationActions';

// Utils
import parseToken from '../../../utils/parseToken';
import { isEmptyContentDate, getTimeFromNow } from '../../../utils/time';

// Component
import UpvoteView from '../view/upvoteView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class UpvoteContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _setUpvotePercent = value => {
    const { dispatch } = this.props;

    if (value) {
      setUpvotePercent(String(value));
      dispatch(upvoteAction(value));
    }
  };

  render() {
    const {
      content,
      currentAccount,
      fetchPost,
      isLoggedIn,
      isShowPayoutValue,
      pinCode,
      upvotePercent,
      globalProps,
    } = this.props;

    const author = get(content, 'author');
    const isVoted =
      get(content, 'is_voted', false) && parseInt(get(content, 'is_voted'), 10) / 10000;
    const isDownVoted =
      get(content, 'is_down_voted', false) &&
      (parseInt(get(content, 'is_down_voted'), 10) / 10000) * -1;

    const totalPayout = get(content, 'total_payout');
    const isDecinedPayout = get(content, 'is_declined_payout');
    const permlink = get(content, 'permlink');
    const pendingPayout = parseToken(get(content, 'pending_payout_value', 0)).toFixed(3);
    const promotedPayout = parseToken(get(content, 'promoted', 0)).toFixed(3);
    const authorPayout = parseToken(get(content, 'total_payout_value', 0)).toFixed(3);
    const curationPayout = parseToken(get(content, 'curator_payout_value', 0)).toFixed(3);
    const payoutDate = getTimeFromNow(
      isEmptyContentDate(get(content, 'last_payout'))
        ? get(content, 'cashout_time')
        : get(content, 'last_payout'),
    );
    const beneficiaries = [];
    const beneficiary = get(content, 'beneficiaries');
    if (beneficiaries) {
      beneficiary.forEach(key => {
        beneficiaries.push(
          `\n  ${get(key, 'account')}: ${(parseFloat(get(key, 'weight')) / 100).toFixed(2)}%`,
        );
      });
    }
    const minimumAmountForPayout = 0.02;
    let warnZeroPayout = false;
    if (pendingPayout > 0 && pendingPayout < minimumAmountForPayout) {
      warnZeroPayout = true;
    }
    const { base, quote, sbdPrintRate } = globalProps;
    const SBD_PRINT_RATE_MAX = 10000;
    const percent_steem_dollars = get(content, 'percent_steem_dollars') / 20000;
    const pending_payout_sbd = pendingPayout * percent_steem_dollars;
    const price_per_steem = base / quote;

    const pending_payout_sp = (pendingPayout - pending_payout_sbd) / price_per_steem;
    const pending_payout_printed_sbd = pending_payout_sbd * (sbdPrintRate / SBD_PRINT_RATE_MAX);
    const pending_payout_printed_steem =
      (pending_payout_sbd - pending_payout_printed_sbd) / price_per_steem;

    const breakdownPayout =
      pending_payout_printed_sbd.toFixed(3) +
      ' SBD, ' +
      pending_payout_printed_steem.toFixed(3) +
      ' STEEM, ' +
      pending_payout_sp.toFixed(3) +
      ' SP';

    return (
      <UpvoteView
        author={author}
        authorPayout={authorPayout}
        curationPayout={curationPayout}
        currentAccount={currentAccount}
        fetchPost={fetchPost}
        globalProps={globalProps}
        handleSetUpvotePercent={this._setUpvotePercent}
        isDecinedPayout={isDecinedPayout}
        isLoggedIn={isLoggedIn}
        isShowPayoutValue={isShowPayoutValue}
        isVoted={isVoted}
        isDownVoted={isDownVoted}
        payoutDate={payoutDate}
        pendingPayout={pendingPayout}
        permlink={permlink}
        pinCode={pinCode}
        promotedPayout={promotedPayout}
        totalPayout={totalPayout}
        upvotePercent={upvotePercent}
        beneficiaries={beneficiaries}
        warnZeroPayout={warnZeroPayout}
        breakdownPayout={breakdownPayout}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  upvotePercent: state.application.upvotePercent,
  pinCode: state.application.pin,
  currentAccount: state.account.currentAccount,
  globalProps: state.account.globalProps,
});

export default connect(mapStateToProps)(UpvoteContainer);
