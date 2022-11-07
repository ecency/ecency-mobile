import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services and Actions
import {
  setCommentUpvotePercent,
  setPostUpvotePercent,
} from '../../../redux/actions/applicationActions';

// Utils
import { getTimeFromNow } from '../../../utils/time';
import { isVoted as isVotedFunc, isDownVoted as isDownVotedFunc } from '../../../utils/postParser';
import parseAsset from '../../../utils/parseAsset';

// Component
import UpvoteView from '../view/upvoteView';
import { updateVoteCache } from '../../../redux/actions/cacheActions';
import { useAppSelector } from '../../../hooks';
import postTypes from '../../../constants/postTypes';

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
    postUpvotePercent,
    commentUpvotePercent,
    globalProps,
    dispatch,
    activeVotes = [],
    handleCacheVoteIncrement,
    fetchPost,
    parentType,
    boldPayout,
  } = props;

  const [isVoted, setIsVoted] = useState(null);
  const [isDownVoted, setIsDownVoted] = useState(null);
  const [totalPayout, setTotalPayout] = useState(get(content, 'total_payout'));
  const cachedVotes = useAppSelector((state) => state.cache.votes);
  const lastCacheUpdate = useAppSelector((state) => state.cache.lastUpdate);

  useEffect(() => {
    let _isMounted = true;

    const _calculateVoteStatus = async () => {
      const _isVoted = await isVotedFunc(activeVotes, get(currentAccount, 'name'));
      const _isDownVoted = await isDownVotedFunc(activeVotes, get(currentAccount, 'name'));

      if (_isMounted) {
        setIsVoted(_isVoted && parseInt(_isVoted, 10) / 10000);
        setIsDownVoted(_isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1);

        if (cachedVotes && cachedVotes.size > 0) {
          _handleCachedVote();
        }
      }
    };

    _calculateVoteStatus();
    return () => (_isMounted = false);
  }, [activeVotes]);

  useEffect(() => {
    const postPath = `${content.author || ''}/${content.permlink || ''}`;
    // this conditional makes sure on targetted already fetched post is updated
    // with new cache status, this is to avoid duplicate cache merging
    if (
      lastCacheUpdate &&
      lastCacheUpdate.postPath === postPath &&
      content.post_fetched_at < lastCacheUpdate.updatedAt &&
      lastCacheUpdate.type === 'vote'
    ) {
      _handleCachedVote();
    }
  }, [lastCacheUpdate]);

  const _setUpvotePercent = (value) => {
    if (value) {
      if (parentType === postTypes.POST) {
        dispatch(setPostUpvotePercent(value));
      }
      if (parentType === postTypes.COMMENT) {
        dispatch(setCommentUpvotePercent(value));
      }
    }
  };

  const _handleCachedVote = () => {
    const postPath = `${content.author || ''}/${content.permlink || ''}`;
    const postFetchedAt = get(content, 'post_fetched_at', 0);

    if (cachedVotes.has(postPath)) {
      const cachedVote = cachedVotes.get(postPath);
      const { expiresAt, amount, isDownvote, incrementStep } = cachedVote;

      if (postFetchedAt > expiresAt) {
        return;
      }

      setTotalPayout(get(content, 'total_payout') + amount);
      if (incrementStep > 0) {
        handleCacheVoteIncrement();
      }

      setIsDownVoted(!!isDownvote);
      setIsVoted(!isDownvote);
    }
  };

  const _onVote = (amount, isDownvote) => {
    // do all relevant processing here to show local upvote
    const amountNum = parseFloat(amount);

    let incrementStep = 0;
    if (!isVoted && !isDownVoted) {
      incrementStep = 1;
    }

    // update redux
    const postPath = `${content.author || ''}/${content.permlink || ''}`;
    const curTime = new Date().getTime();
    const vote = {
      votedAt: curTime,
      amount: amountNum,
      isDownvote,
      incrementStep,
      expiresAt: curTime + 30000,
    };
    dispatch(updateVoteCache(postPath, vote));
  };

  const author = get(content, 'author');
  const isDeclinedPayout = get(content, 'is_declined_payout');
  const permlink = get(content, 'permlink');
  const pendingPayout = parseAsset(content.pending_payout_value).amount;
  const authorPayout = parseAsset(content.author_payout_value).amount;
  const curationPayout = parseAsset(content.curator_payout_value).amount;
  const promotedPayout = parseAsset(content.promoted).amount;
  const maxPayout = content.max_payout;

  const payoutDate = getTimeFromNow(get(content, 'payout_at'));
  const beneficiaries = [];
  const beneficiary = get(content, 'beneficiaries');
  if (beneficiary) {
    beneficiary.forEach((key, index) => {
      beneficiaries.push(
        `${index !== 0 ? '\n' : ''}${get(key, 'account')}: ${(
          parseFloat(get(key, 'weight')) / 100
        ).toFixed(2)}%`,
      );
    });
  }
  const minimumAmountForPayout = 0.02;
  let warnZeroPayout = false;
  if (pendingPayout > 0 && pendingPayout < minimumAmountForPayout) {
    warnZeroPayout = true;
  }

  // assemble breakdown
  const base = get(globalProps, 'base', 0);
  const quote = get(globalProps, 'quote', 0);
  const hbdPrintRate = get(globalProps, 'hbdPrintRate', 0);
  const SBD_PRINT_RATE_MAX = 10000;
  const percent_steem_dollars = (content.percent_hbd || 10000) / 20000;

  const pending_payout_hbd = pendingPayout * percent_steem_dollars;
  const price_per_steem = base / quote;

  const pending_payout_hp = (pendingPayout - pending_payout_hbd) / price_per_steem;
  const pending_payout_printed_hbd = pending_payout_hbd * (hbdPrintRate / SBD_PRINT_RATE_MAX);
  const pending_payout_printed_hive =
    (pending_payout_hbd - pending_payout_printed_hbd) / price_per_steem;

  const breakdownPayout =
    (pending_payout_printed_hbd > 0 ? `${pending_payout_printed_hbd.toFixed(3)} HBD\n` : '') +
    (pending_payout_printed_hive > 0 ? `${pending_payout_printed_hive.toFixed(3)} HIVE\n` : '') +
    (pending_payout_hp > 0 ? `${pending_payout_hp.toFixed(3)} HP` : '');

  return (
    <UpvoteView
      author={author}
      authorPayout={authorPayout}
      curationPayout={curationPayout}
      currentAccount={currentAccount}
      globalProps={globalProps}
      handleSetUpvotePercent={_setUpvotePercent}
      isDeclinedPayout={isDeclinedPayout}
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
      maxPayout={maxPayout}
      postUpvotePercent={postUpvotePercent}
      commentUpvotePercent={commentUpvotePercent}
      parentType={parentType}
      beneficiaries={beneficiaries}
      warnZeroPayout={warnZeroPayout}
      breakdownPayout={breakdownPayout}
      fetchPost={fetchPost}
      onVote={_onVote}
      boldPayout={boldPayout}
    />
  );
};

// Component Life Cycle Functions

// Component Functions

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  postUpvotePercent: state.application.postUpvotePercent,
  commentUpvotePercent: state.application.commentUpvotePercent,
  pinCode: state.application.pin,
  currentAccount: state.account.currentAccount,
  globalProps: state.account.globalProps,
});

export default connect(mapStateToProps)(UpvoteContainer);
