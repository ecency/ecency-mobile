import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Realm
import { setUpvotePercent } from '../../../realm/realm';

// Services and Actions
import { setUpvotePercent as upvoteAction } from '../../../redux/actions/applicationActions';

// Utils
import { getTimeFromNow } from '../../../utils/time';
import { isVoted as isVotedFunc, isDownVoted as isDownVotedFunc } from '../../../utils/postParser';
import parseAsset from '../../../utils/parseAsset';

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

  _setUpvotePercent = (value) => {
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
      activeVotes = [],
    } = this.props;

    const _isVoted = isVotedFunc(activeVotes, get(currentAccount, 'name'));
    const _isDownVoted = isDownVotedFunc(activeVotes, get(currentAccount, 'name'));

    const author = get(content, 'author');
    const isVoted = _isVoted && parseInt(_isVoted, 10) / 10000;
    const isDownVoted = _isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1;

    const totalPayout = get(content, 'total_payout');
    const isDecinedPayout = get(content, 'is_declined_payout');
    const permlink = get(content, 'permlink');
    const pendingPayout = parseAsset(content.pending_payout_value).amount;
    const authorPayout = parseAsset(content.author_payout_value).amount;
    const curationPayout = parseAsset(content.curator_payout_value).amount;
    const promotedPayout = parseAsset(content.promoted).amount;
    const payoutDate = getTimeFromNow(get(content, 'payout_at'));
    const beneficiaries = [];
    const beneficiary = get(content, 'beneficiaries');
    if (beneficiaries) {
      beneficiary.forEach((key) => {
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
    const base = get(globalProps, 'base', 0);
    const quote = get(globalProps, 'quote', 0);
    const sbdPrintRate = get(globalProps, 'sbdPrintRate', 0);
    const SBD_PRINT_RATE_MAX = 10000;
    const percent_steem_dollars = (content.percent_hbd || 10000) / 20000;

    const pending_payout_hbd = pendingPayout * percent_steem_dollars;
    const price_per_steem = base / quote;

    const pending_payout_hp = (pendingPayout - pending_payout_hbd) / price_per_steem;
    const pending_payout_printed_hbd = pending_payout_hbd * (sbdPrintRate / SBD_PRINT_RATE_MAX);
    const pending_payout_printed_hive =
      (pending_payout_hbd - pending_payout_printed_hbd) / price_per_steem;

    const breakdownPayout =
      pending_payout_printed_hbd.toFixed(3) +
      ' HBD, ' +
      pending_payout_printed_hive.toFixed(3) +
      ' HIVE, ' +
      pending_payout_hp.toFixed(3) +
      ' HP';

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

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  upvotePercent: state.application.upvotePercent,
  pinCode: state.application.pin,
  currentAccount: state.account.currentAccount,
  globalProps: state.account.globalProps,
});

export default connect(mapStateToProps)(UpvoteContainer);
