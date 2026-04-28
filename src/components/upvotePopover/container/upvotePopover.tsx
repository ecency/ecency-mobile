import React, { Fragment, useState, forwardRef, useImperativeHandle, useRef, Ref } from 'react';
import get from 'lodash/get';

// Services and Actions
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import Popover, { PopoverPlacement as Placement, Rect } from 'react-native-popover-view';
import Slider from '@react-native-community/slider';
import { useIntl } from 'react-intl';
import { useVote, votingPower as sdkVotingPower, votingRshares, votingValue } from '@ecency/sdk';
import {
  setCommentUpvotePercent,
  setPostUpvotePercent,
  setWaveUpvotePercent,
} from '../../../redux/actions/applicationActions';

// Utils
import { isVoted as isVotedFunc, isDownVoted as isDownVotedFunc } from '../../../utils/postParser';

// Component
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { PostTypes } from '../../../constants/postTypes';

// Utils
import {
  selectIsLoggedIn,
  selectPostUpvotePercent,
  selectCommentUpvotePercent,
  selectWaveUpvotePercent,
  selectCurrentAccount,
  selectGlobalProps,
} from '../../../redux/selectors';

// Components
import { Icon } from '../../icon';

// Services
import { setRcOffer, toastNotification } from '../../../redux/actions/uiAction';
import { useAuthContext } from '../../../providers/sdk';
import {
  updateVoteInQueryCaches,
  VoteCacheEntry,
} from '../../../providers/queries/postQueries/voteCacheUtils';

// Styles
import styles from '../children/upvoteStyles';

import { PayoutDetailsContent } from '../children/payoutDetailsContent';
import showLoginAlert from '../../../utils/showLoginAlert';

interface PopoverOptions {
  sourceRef: Ref<any>;
  content: any;
  postType?: PostTypes;
  showPayoutDetails?: boolean;
  onVotingStart?: (isVoting: boolean) => void;
}

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

// eslint-disable-next-line no-empty-pattern
const UpvotePopover = forwardRef(({}, ref) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const deviceWidth = useWindowDimensions().width;

  const onVotingStartRef = useRef<any>(null);
  const sourceRef = useRef<any>(null);
  const sourceRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  // Monotonic id incremented on every measure() call. The async measure
  // callback captures the id at call time and only commits its result if it
  // still matches — discards stale callbacks when showPopover() is invoked
  // multiple times in quick succession.
  const measureCallIdRef = useRef(0);
  const isVotingRef = useRef(false);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const postUpvotePercent = useAppSelector(selectPostUpvotePercent);
  const commentUpvotePercent = useAppSelector(selectCommentUpvotePercent);
  const waveUpvotePercent = useAppSelector(selectWaveUpvotePercent);

  const currentAccount = useAppSelector(selectCurrentAccount);
  const globalProps = useAppSelector(selectGlobalProps);

  const authContext = useAuthContext();
  const voteMutation = useVote(currentAccount?.name, authContext, 'async');

  const [content, setContent] = useState<any>(null);
  const [postType, setPostType] = useState<PostTypes>(PostTypes.POST);
  const [showPopover, setShowPopover] = useState(false);
  const [showPayoutDetails, setShowPayoutDetails] = useState(false);

  const [isVoted, setIsVoted] = useState<any>(null);
  const [isDownVoted, setIsDownVoted] = useState<any>(null);

  const [sliderValue, setSliderValue] = useState(1);
  const [amount, setAmount] = useState('0.00000');

  // Use SDK's votingValue (same formula as vision-next web) for vote estimation
  const _estimateVoteValue = (account: any, props: any, sliderVal: number) => {
    const vPower = sdkVotingPower(account) * 100;
    const weight = Math.abs(sliderVal) * 10000;
    return votingValue(account, props, vPower, weight);
  };

  const _formatEstimate = (value: number) => {
    if (Number.isNaN(value)) {
      return '0.00';
    } else if (value >= 1) {
      return value.toFixed(2);
    }
    // toPrecision can emit "1e-7"-style scientific notation for tiny values;
    // floor anything below 0.001 to a stable "<0.001" string and otherwise
    // use toFixed(4) so the result always reads as a plain decimal.
    const _fixed = parseFloat(value.toFixed(4));
    if (_fixed < 0.001) {
      return value > 0 ? '<0.001' : '0.00';
    }
    return _fixed.toFixed(4);
  };

  useImperativeHandle(ref, () => ({
    showPopover: ({
      sourceRef: _sourceRef,
      content: _content,
      postType: _postType,
      showPayoutDetails: _showPayoutDetails,
      onVotingStart,
    }: PopoverOptions) => {
      if (!isLoggedIn && !_showPayoutDetails) {
        showLoginAlert({ intl });
        return;
      }

      onVotingStartRef.current = onVotingStart;
      sourceRef.current = _sourceRef.current;

      // Compute all derived state synchronously before showing the popover
      // to prevent effects from causing re-renders during the popover animation
      const activeVotes = _content?.active_votes || [];
      const _isVoted = isVotedFunc(activeVotes, get(currentAccount, 'name'));
      const _isDownVoted = isDownVotedFunc(activeVotes, get(currentAccount, 'name'));

      const resolvedPostType = _postType || PostTypes.POST;
      let _upvotePercent = 1;
      switch (resolvedPostType) {
        case PostTypes.POST:
          _upvotePercent = postUpvotePercent;
          break;
        case PostTypes.COMMENT:
          _upvotePercent = commentUpvotePercent;
          break;
        case PostTypes.WAVE:
          _upvotePercent = waveUpvotePercent;
          break;
      }

      const _amount =
        currentAccount && Object.entries(currentAccount).length !== 0 && globalProps
          ? _formatEstimate(_estimateVoteValue(currentAccount, globalProps, _upvotePercent))
          : '0.00000';

      setIsVoted(_isVoted && parseInt(_isVoted, 10) / 10000);
      setIsDownVoted(_isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1);
      setSliderValue(_upvotePercent);
      setAmount(_amount);
      setPostType(resolvedPostType);
      setContent(_content);
      setShowPayoutDetails(_showPayoutDetails || false);

      // Pre-measure source element position before showing popover.
      // This avoids the expensive synchronous layout pass that react-native-popover-view
      // triggers when it measures the ref itself on complex pages (post detail with
      // rendered HTML body + comments causes ~2s freeze on iOS).
      if (_sourceRef.current?.measure) {
        const _measureId = ++measureCallIdRef.current;
        _sourceRef.current.measure(
          (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
            // Discard if a newer showPopover() supersedes this measurement.
            if (_measureId !== measureCallIdRef.current) return;
            sourceRectRef.current = { x: pageX, y: pageY, width, height };
            setShowPopover(true);
          },
        );
      } else {
        // Bump so any in-flight measure callback for the previous call is
        // ignored when it eventually fires.
        measureCallIdRef.current += 1;
        sourceRectRef.current = null;
        setShowPopover(true);
      }
    },
  }));

  // Component Functions
  const _calculateEstimatedAmount = (value: number = sliderValue) => {
    if (currentAccount && Object.entries(currentAccount).length !== 0 && globalProps) {
      setAmount(_formatEstimate(_estimateVoteValue(currentAccount, globalProps, value)));
    }
  };

  const _upvoteContent = async () => {
    if (isVotingRef.current) {
      return;
    }

    if (!isDownVoted) {
      const _onVotingStart = onVotingStartRef.current;
      isVotingRef.current = true;

      const _author = content?.author;
      const _permlink = content?.permlink;

      try {
        _closePopover();
        _onVotingStart ? _onVotingStart(sliderValue) : null;

        _setUpvotePercent(sliderValue);

        // Update vote cache optimistically before awaiting mutation
        // to prevent any window where button state and cache are inconsistent
        _updateVoteCache(_author, _permlink, amount, false, sliderValue ? 'PUBLISHED' : 'DELETED');

        const weight = sliderValue ? Math.trunc(sliderValue * 100) * 100 : 0;

        console.log(`casting up vote: ${weight}`);

        voteMutation.reset();
        await voteMutation.mutateAsync({
          author: _author,
          permlink: _permlink,
          weight,
          estimated: parseFloat(amount),
        });

        setIsVoted(!!sliderValue);
      } catch (err) {
        const _error = err as any;

        _updateVoteCache(_author, _permlink, amount, false, 'FAILED');
        _onVotingStart ? _onVotingStart(0) : null;
        if (
          _error &&
          _error.response &&
          _error.response.jse_shortmsg &&
          _error.response.jse_shortmsg.includes('wait to transact')
        ) {
          setIsVoted(false);
          dispatch(setRcOffer(true));
        } else if (
          _error &&
          _error.jse_shortmsg &&
          _error.jse_shortmsg.includes('wait to transact')
        ) {
          setIsVoted(false);
          dispatch(setRcOffer(true));
        } else {
          let errMsg = '';
          if (_error?.message && _error.message.indexOf(':') > 0) {
            [, errMsg] = _error.message.split(': ');
          } else {
            errMsg = _error?.jse_shortmsg || _error?.error_description || _error?.message;
          }
          dispatch(
            toastNotification(
              intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: errMsg }),
            ),
          );
        }
      } finally {
        isVotingRef.current = false;
      }
    } else {
      setIsDownVoted(false);
    }
  };

  const _downvoteContent = async () => {
    if (isVotingRef.current) {
      return;
    }

    const _onVotingStart = onVotingStartRef.current;
    if (isDownVoted) {
      isVotingRef.current = true;

      const _author = content?.author;
      const _permlink = content?.permlink;

      try {
        _closePopover();
        _onVotingStart ? _onVotingStart(-sliderValue) : null;

        _setUpvotePercent(sliderValue);

        // Update vote cache optimistically before awaiting mutation
        // to prevent any window where button state and cache are inconsistent
        _updateVoteCache(_author, _permlink, amount, true, sliderValue ? 'PUBLISHED' : 'DELETED');

        const weight = sliderValue ? Math.trunc(sliderValue * 100) * -100 : 0;

        console.log(`casting down vote: ${weight}`);

        voteMutation.reset();
        await voteMutation.mutateAsync({
          author: _author,
          permlink: _permlink,
          weight,
          estimated: parseFloat(amount),
        });

        setIsDownVoted(!!sliderValue);
      } catch (err) {
        const _error = err as any;

        dispatch(
          toastNotification(
            intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: _error?.message }),
          ),
        );
        _updateVoteCache(_author, _permlink, amount, true, 'FAILED');
        setIsDownVoted(false);
        _onVotingStart ? _onVotingStart(0) : null;
      } finally {
        isVotingRef.current = false;
      }
    } else {
      setIsDownVoted(true);
    }
  };

  const _setUpvotePercent = (value) => {
    if (value) {
      let _dispatchAction: any = null;
      switch (postType) {
        case PostTypes.POST:
          _dispatchAction = setPostUpvotePercent;
          break;
        case PostTypes.COMMENT:
          _dispatchAction = setCommentUpvotePercent;
          break;
        case PostTypes.WAVE:
          _dispatchAction = setWaveUpvotePercent;
          break;
      }
      if (_dispatchAction) {
        dispatch(_dispatchAction(value));
      }
    }
  };

  const _updateVoteCache = (
    author: string,
    permlink: string,
    amount: string,
    isDownvote: boolean,
    status: VoteCacheEntry['status'],
  ) => {
    const amountNum = parseFloat(amount);

    let incrementStep = 0;
    if (!isVoted && !isDownVoted) {
      incrementStep = 1;
    }

    const percent = Math.trunc(sliderValue * 100) * 100 * (isDownvote ? -1 : 1);
    // votingRshares can throw when account or globalProps haven't loaded —
    // mirror the guard used for _amount so optimistic cache updates don't
    // crash the vote flow before data is ready.
    const _rsharesReady =
      currentAccount && Object.entries(currentAccount).length !== 0 && globalProps;
    const rshares = _rsharesReady
      ? votingRshares(
          currentAccount,
          globalProps as any,
          sdkVotingPower(currentAccount) * 100,
          Math.abs(percent),
        ) * (isDownvote ? -1 : 1)
      : 0;

    const curTime = new Date().getTime();
    updateVoteInQueryCaches(author, permlink, {
      votedAt: curTime,
      amount: amountNum,
      isDownvote,
      rshares,
      percent,
      incrementStep,
      voter: currentAccount?.name || '',
      status,
    });
  };

  const _closePopover = () => {
    setShowPopover(false);
    sourceRectRef.current = null;

    setTimeout(() => {
      setShowPayoutDetails(false);
    }, 300);
  };

  if (!showPopover) {
    return null;
  }

  const iconName = 'upcircleo';
  const downVoteIconName = 'downcircleo';

  const _percent = `${isDownVoted ? '-' : ''}${(sliderValue * 100).toFixed(0)}%`;
  const _amount = `$${amount}`;

  const sliderColor = isDownVoted ? '#ec8b88' : '#357ce6';

  const _minSliderVal = isVoted || isDownVoted ? 0 : 0.01;

  const _sliderWidth = deviceWidth - 24;
  const _sliderStyle = { ...styles.popoverSlider, width: _sliderWidth };

  // Use pre-measured rect to avoid expensive synchronous layout pass
  const _fromProp = sourceRectRef.current
    ? new Rect(
        sourceRectRef.current.x,
        sourceRectRef.current.y,
        sourceRectRef.current.width,
        sourceRectRef.current.height,
      )
    : sourceRef;

  return (
    <Fragment>
      <Popover
        popoverStyle={showPayoutDetails ? styles.popoverDetails : _sliderStyle}
        arrowSize={showPayoutDetails ? undefined : { width: 0, height: 0 }}
        backgroundStyle={styles.overlay}
        isVisible={showPopover}
        onRequestClose={() => {
          _closePopover();
        }}
        from={_fromProp}
        placement={[Placement.TOP]}
        offset={12}
      >
        <View style={styles.popoverWrapper}>
          {showPayoutDetails ? (
            <PayoutDetailsContent content={content} />
          ) : (
            <Fragment>
              <TouchableOpacity onPress={_upvoteContent} style={styles.upvoteButton}>
                <Icon
                  size={20}
                  style={[styles.upvoteIcon, { color: '#007ee5' }]}
                  active={!isLoggedIn}
                  iconType="AntDesign"
                  name={iconName}
                />
              </TouchableOpacity>
              <Text style={styles.amount}>{_amount}</Text>
              <Slider
                style={styles.slider}
                minimumTrackTintColor={sliderColor}
                maximumTrackTintColor="#b1b1b1"
                thumbTintColor="#007ee5"
                minimumValue={_minSliderVal}
                maximumValue={1}
                value={sliderValue}
                onValueChange={(value) => {
                  setSliderValue(value);
                  _calculateEstimatedAmount(value);
                }}
              />
              <Text style={styles.percent}>{_percent}</Text>
              <TouchableOpacity onPress={_downvoteContent} style={styles.upvoteButton}>
                <Icon
                  size={20}
                  style={[styles.upvoteIcon, { color: '#ec8b88' }]}
                  active={!isLoggedIn}
                  iconType="AntDesign"
                  name={downVoteIconName}
                />
              </TouchableOpacity>
            </Fragment>
          )}
        </View>
      </Popover>
    </Fragment>
  );
});

export default UpvotePopover;
