import React, { useState, useEffect } from 'react';
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

const UpvoteContainer = (props) => {
  const {
    content,
    currentAccount,
    isLoggedIn,
    isShowPayoutValue,
    pinCode,
    upvotePercent,
    globalProps,
    dispatch,
    activeVotes = [],
    incrementVoteCount,
    fetchPost,
  } = props;

  const [isVoted, setIsVoted] = useState(null);
  const [isDownVoted, setIsDownVoted] = useState(null);
  const [totalPayout, setTotalPayout] = useState(get(content, 'total_payout'))

  useEffect(() => {
    _calculateVoteStatus();
  }, [activeVotes]);

  const _calculateVoteStatus = async () => {
    const _isVoted = await isVotedFunc(activeVotes, get(currentAccount, 'name'));
    const _isDownVoted = await isDownVotedFunc(activeVotes, get(currentAccount, 'name'));

    setIsVoted(_isVoted && parseInt(_isVoted, 10) / 10000);
    setIsDownVoted(_isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1);
  };

  const _setUpvotePercent = (value) => {
    if (value) {
      setUpvotePercent(String(value));
      dispatch(upvoteAction(value));
    }
  };

  const _onVote = (amount, isDownvote) => {
    //do all relevant processing here to show local upvote
    const amountNum = parseFloat(amount);

    setTotalPayout(totalPayout + amountNum)

    if(!isVoted && !isDownVoted && incrementVoteCount){
      incrementVoteCount()
    }

    if(isDownvote){
      setIsDownVoted(true);
    }else{
      setIsVoted(true);
    }

  }

  const author = get(content, 'author');
  const isDecinedPayout = get(content, 'is_declined_payout');
  const permlink = get(content, 'permlink');
  const pendingPayout = parseAsset(content.pending_payout_value).amount;
  const authorPayout = parseAsset(content.author_payout_value).amount;
  const curationPayout = parseAsset(content.curator_payout_value).amount;
  const promotedPayout = parseAsset(content.promoted).amount;
  const payoutDate = getTimeFromNow(get(content, 'payout_at'));
  const beneficiaries = [];
  const beneficiary = get(content, 'beneficiaries');
  if (beneficiary) {
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
      globalProps={globalProps}
      handleSetUpvotePercent={_setUpvotePercent}
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
      fetchPost={fetchPost}
      onVote={_onVote}
    />
  );
};

// Component Life Cycle Functions

// Component Functions

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  upvotePercent: state.application.upvotePercent,
  pinCode: state.application.pin,
  currentAccount: state.account.currentAccount,
  globalProps: state.account.globalProps,
});

export default connect(mapStateToProps)(UpvoteContainer);
