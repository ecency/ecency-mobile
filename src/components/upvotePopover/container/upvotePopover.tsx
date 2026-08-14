import React, { Fragment, useState, forwardRef, useImperativeHandle, useRef, Ref } from 'react';
import * as Sentry from '@sentry/react-native';
import get from 'lodash/get';

// Services and Actions
import { View, TouchableOpacity, Text, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Popover, { PopoverPlacement as Placement, Rect } from 'react-native-popover-view';
import { useIntl } from 'react-intl';
import { useVote, votingPower as sdkVotingPower, votingRshares, votingValue } from '@ecency/sdk';
import {
  setCommentUpvotePercent,
  setPostUpvotePercent,
  setWaveUpvotePercent,
  maybeRequestReview,
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
import VoteSlider from '../children/voteSlider';
import PercentKeypad from '../children/percentKeypad';
import showLoginAlert from '../../../utils/showLoginAlert';
import { isInsufficientRcError } from '../../../utils/rcError';

// Transport-level failure signatures. The SDK broadcasts votes in 'async' mode,
// which resolves before chain inclusion is confirmed, so an error matching this
// pattern usually means the vote still landed — the request just couldn't be
// confirmed (slow/dropped connection, broadcast timeout, garbled RPC response).
const NETWORK_ERROR_PATTERN = new RegExp(
  [
    'abort',
    'timed?\\s?out',
    'timeout',
    'network request failed',
    'failed to fetch',
    'load failed',
    'socket hang up',
    'JSONRPC id mismatch',
    'ECONNREFUSED',
    'ECONNRESET',
    'ENOTFOUND',
    'EHOSTUNREACH',
    'EAI_AGAIN',
    'ETIMEDOUT',
  ].join('|'),
  'i',
);

function isNetworkLevelVoteError(error: any): boolean {
  if (!error) {
    return false;
  }
  const name = String(error.name || '');
  if (name === 'AbortError' || name === 'TimeoutError') {
    return true;
  }
  const haystack = [error.message, error.code, error.cause?.message, error.cause?.code]
    .filter(Boolean)
    .map(String)
    .join(' ');
  return NETWORK_ERROR_PATTERN.test(haystack);
}

// Vote rejections from the SDK async-broadcast path are often non-Error objects
// (dhive RPCError-like), so String(error) yields "[object Object]" and the real cause
// is lost both in Sentry and in the user toast. Walk the common shapes first.
function extractVoteErrorMessage(error: any): string {
  if (!error) {
    return 'Unknown vote error';
  }
  if (typeof error === 'string') {
    return error;
  }
  const candidate =
    error.jse_shortmsg ||
    error.error_description ||
    error.error?.message ||
    error.data?.message ||
    error.response?.data?.message ||
    error.response?.jse_shortmsg ||
    error.message ||
    error.cause?.message;
  if (candidate) {
    return String(candidate);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function logVoteError(
  kind: 'upvote' | 'downvote',
  error: any,
  networkLevel: boolean,
  author?: string,
  permlink?: string,
) {
  const resolvedMessage = extractVoteErrorMessage(error);
  const info = {
    kind,
    networkLevel,
    author,
    permlink,
    name: error?.name,
    code: error?.code,
    message: error?.message,
    resolvedMessage,
    jse_shortmsg: error?.jse_shortmsg,
    error_description: error?.error_description,
  };
  console.warn(`[vote] ${kind} mutation rejected (networkLevel=${networkLevel})`, info);
  Sentry.captureException(error instanceof Error ? error : new Error(resolvedMessage), {
    level: networkLevel ? 'warning' : 'error',
    tags: { feature: 'vote', voteKind: kind, voteNetworkLevel: String(networkLevel) },
    // Group by real cause instead of collapsing every non-Error under "[object Object]".
    fingerprint: ['vote', kind, String(error?.name || error?.code || 'unknown')],
    extra: info,
  } as any);
}

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
  const safeAreaInsets = useSafeAreaInsets();

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
  const [isEditingPercent, setIsEditingPercent] = useState(false);

  const [isVoted, setIsVoted] = useState<any>(null);
  const [isDownVoted, setIsDownVoted] = useState<any>(null);

  const [sliderValue, setSliderValue] = useState(1);
  const [amount, setAmount] = useState('0.00000');

  // Use SDK's votingValue (same formula as vision-web web) for vote estimation
  const _estimateVoteValue = (account: any, props: any, sliderVal: number) => {
    const vPower = sdkVotingPower(account) * 100;
    const weight = Math.abs(sliderVal) * 10000;
    return votingValue(account, props, vPower, weight);
  };

  const _formatEstimate = (value: number) => {
    if (Number.isNaN(value) || value <= 0) {
      return '0.000';
    } else if (value >= 1) {
      return value.toFixed(2);
    }
    // Cap at 3 decimals and floor sub-0.001 values at "0.001": a 6-decimal
    // string like "0.000428" is too wide and crowds the slider. Stay a plain
    // numeric string so parseFloat(amount) downstream never produces NaN — no
    // non-numeric "<0.001" sentinel.
    if (value < 0.001) {
      return '0.001';
    }
    return value.toFixed(3);
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
      (sourceRef as any).current = (_sourceRef as any).current;

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
      setIsEditingPercent(false);

      // Pre-measure source element position before showing popover.
      // This avoids the expensive synchronous layout pass that react-native-popover-view
      // triggers when it measures the ref itself on complex pages (post detail with
      // rendered HTML body + comments causes ~2s freeze on iOS).
      if ((_sourceRef as any).current?.measure) {
        const _measureId = ++measureCallIdRef.current;
        (_sourceRef as any).current.measure(
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

  const _onSliderValueChange = (value: number) => {
    setSliderValue(value);
    _calculateEstimatedAmount(value);
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

        // Math.round (not trunc) + min-1 floor: Android's float32 slider
        // returns the 0.01 minimum as ~0.00999999977, which trunc floored to a
        // weight of 0 → on-chain "Vote weight cannot be 0" assert despite the
        // UI showing "1%". Keeps weight consistent with the displayed percent.
        const weight = sliderValue ? Math.max(1, Math.round(sliderValue * 100)) * 100 : 0;

        console.log(`casting up vote: ${weight}`);

        voteMutation.reset();
        await voteMutation.mutateAsync({
          author: _author,
          permlink: _permlink,
          weight,
          estimated: parseFloat(amount),
        });

        setIsVoted(!!sliderValue);

        // A successful upvote is a positive signal — surface the rating prompt
        // to engaged users (gated internally by maybeRequestReview). Skip
        // vote removals (sliderValue === 0).
        if (sliderValue) {
          dispatch(maybeRequestReview());
        }
      } catch (err) {
        const _error = err as any;
        const _networkLevel = isNetworkLevelVoteError(_error);

        if (_networkLevel) {
          logVoteError('upvote', _error, true, _author, _permlink);
          // Async broadcast can't confirm chain inclusion; a transport-level
          // failure here most often means the vote still landed. Keep the
          // optimistic state and let the next refetch reconcile a true failure
          // rather than showing a false "Something went wrong".
          setIsVoted(!!sliderValue);
        } else {
          _updateVoteCache(_author, _permlink, amount, false, 'FAILED');
          _onVotingStart ? _onVotingStart(0) : null;

          if (isInsufficientRcError(_error)) {
            setIsVoted(false);
            dispatch(setRcOffer(true));
          } else {
            logVoteError('upvote', _error, false, _author, _permlink);
            const _fullMsg = extractVoteErrorMessage(_error);
            // Strip a leading "Prefix: " (e.g. "RPCError: ...") to show the human part.
            const errMsg =
              _fullMsg.indexOf(': ') > 0 ? _fullMsg.split(': ').slice(1).join(': ') : _fullMsg;
            dispatch(
              toastNotification(
                intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: errMsg }),
              ),
            );
          }
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

        // See _upvoteContent: round + min-1 floor avoids a 0 weight from the
        // Android float32 slider minimum (which fails the on-chain assert).
        const weight = sliderValue ? Math.max(1, Math.round(sliderValue * 100)) * -100 : 0;

        console.log(`casting down vote: ${weight}`);

        voteMutation.reset();
        await voteMutation.mutateAsync({
          author: _author,
          permlink: _permlink,
          weight,
          // Downvotes REDUCE payout, but the SDK's post-broadcast cache write
          // adds `estimated` unsigned (entry.payout + estimated), so a positive
          // value would briefly show the payout INCREASED by the vote value.
          // Pass the negative delta, clamped to the pre-vote payout, so that
          // write lands on the same reduced value our at-press update shows.
          estimated: -Math.min(parseFloat(amount) || 0, content?.total_payout || 0),
        });

        setIsDownVoted(!!sliderValue);
      } catch (err) {
        const _error = err as any;
        const _networkLevel = isNetworkLevelVoteError(_error);

        if (_networkLevel) {
          logVoteError('downvote', _error, true, _author, _permlink);
          // See upvote handler: async broadcast can't confirm inclusion, so a
          // transport-level failure most likely still landed on chain.
          setIsDownVoted(!!sliderValue);
        } else {
          logVoteError('downvote', _error, false, _author, _permlink);
          const _dvFullMsg = extractVoteErrorMessage(_error);
          // Strip a leading "Prefix: " (e.g. "RPCError: ...") to match the upvote toast.
          const _dvErrMsg =
            _dvFullMsg.indexOf(': ') > 0 ? _dvFullMsg.split(': ').slice(1).join(': ') : _dvFullMsg;
          dispatch(
            toastNotification(
              intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: _dvErrMsg }),
            ),
          );
          _updateVoteCache(_author, _permlink, amount, true, 'FAILED');
          setIsDownVoted(false);
          _onVotingStart ? _onVotingStart(0) : null;
        }
      } finally {
        isVotingRef.current = false;
      }
    } else {
      setIsDownVoted(true);
    }
  };

  const _setUpvotePercent = (value: any) => {
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

    // Round (not trunc) to stay consistent with the broadcast weight; trunc
    // under-counted the optimistic cache by one step at the slider minimum.
    const percent = Math.round(sliderValue * 100) * 100 * (isDownvote ? -1 : 1);
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
    setIsEditingPercent(false);

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
  const _amount = `${isDownVoted ? '-' : ''}$${amount}`;

  const sliderColor = isDownVoted ? '#ec8b88' : '#357ce6';

  const _minSliderVal = isVoted || isDownVoted ? 0 : 0.01;

  const _sliderWidth = deviceWidth - 24;
  const _sliderStyle = { ...styles.popoverSlider, width: _sliderWidth };
  const _keypadStyle = { ...styles.popoverKeypad, width: _sliderWidth };

  let _popoverStyle: any = _sliderStyle;
  if (showPayoutDetails) {
    _popoverStyle = styles.popoverDetails;
  } else if (isEditingPercent) {
    _popoverStyle = _keypadStyle;
  }

  // The keypad is much taller than the pill, so while editing allow the popover
  // to flip BELOW the button when there isn't room above (placement=[TOP] alone
  // never flips and the library clips the overflowing bottom row — Done key).
  const _placement = isEditingPercent ? [Placement.TOP, Placement.BOTTOM] : [Placement.TOP];

  // On Android the Modal-hosted popover spans under the translucent status bar,
  // so a high-anchored keypad can clamp beneath the clock/battery. Inset the
  // display area by the safe-area top there (iOS handles its own safe area).
  const _displayAreaInsets =
    Platform.OS === 'android'
      ? { top: safeAreaInsets.top, left: 0, right: 0, bottom: 0 }
      : undefined;

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
        popoverStyle={_popoverStyle}
        arrowSize={showPayoutDetails ? undefined : { width: 0, height: 0 }}
        backgroundStyle={styles.overlay}
        isVisible={showPopover}
        onRequestClose={() => {
          _closePopover();
        }}
        from={_fromProp}
        placement={_placement}
        displayAreaInsets={_displayAreaInsets}
        offset={12}
      >
        <View style={styles.popoverWrapper}>
          {showPayoutDetails ? (
            <PayoutDetailsContent content={content} />
          ) : isEditingPercent ? (
            <PercentKeypad
              value={sliderValue}
              minValue={_minSliderVal}
              amount={amount}
              color={sliderColor}
              onChange={_onSliderValueChange}
              onDone={() => setIsEditingPercent(false)}
            />
          ) : (
            <Fragment>
              <TouchableOpacity
                onPress={_upvoteContent}
                style={styles.upvoteButton}
                accessibilityRole="button"
                accessibilityLabel="Upvote"
              >
                <Icon
                  size={20}
                  style={[styles.upvoteIcon, { color: '#007ee5' }]}
                  iconType="AntDesign"
                  name={iconName}
                />
              </TouchableOpacity>
              <Text style={styles.amount} numberOfLines={1}>
                {_amount}
              </Text>
              <VoteSlider
                color={sliderColor}
                minValue={_minSliderVal}
                value={sliderValue}
                onValueChange={_onSliderValueChange}
                accessibilityLabel={isDownVoted ? 'Downvote weight' : 'Upvote weight'}
              />
              <TouchableOpacity
                style={styles.percentButton}
                onPress={() => setIsEditingPercent(true)}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Edit vote percentage, currently ${_percent}`}
              >
                <Text style={styles.percent} numberOfLines={1}>
                  {_percent}
                </Text>
                <Icon
                  size={11}
                  style={styles.percentEditIcon}
                  iconType="MaterialIcons"
                  name="edit"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={_downvoteContent}
                style={styles.upvoteButton}
                accessibilityRole="button"
                accessibilityLabel="Downvote"
              >
                <Icon
                  size={20}
                  style={[styles.upvoteIcon, { color: '#ec8b88' }]}
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
