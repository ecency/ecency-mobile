import React, {
  Fragment,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  Ref,
} from 'react';
import get from 'lodash/get';

// Services and Actions
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import Popover from 'react-native-popover-view';
import Slider from '@esteemapp/react-native-slider';
import { useIntl } from 'react-intl';
import { Placement } from 'react-native-popover-view/dist/Types';
import { useVote } from '@ecency/sdk';
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

import { calculateEstimatedRShares, getEstimatedAmount } from '../../../utils/vote';
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
  const isVotingRef = useRef(false);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const postUpvotePercent = useAppSelector(selectPostUpvotePercent);
  const commentUpvotePercent = useAppSelector(selectCommentUpvotePercent);
  const waveUpvotePercent = useAppSelector(selectWaveUpvotePercent);

  const currentAccount = useAppSelector(selectCurrentAccount);
  const globalProps = useAppSelector(selectGlobalProps);

  const authContext = useAuthContext();
  const voteMutation = useVote(currentAccount?.name, authContext);

  const [content, setContent] = useState<any>(null);
  const [postType, setPostType] = useState<PostTypes>(PostTypes.POST);
  const [showPopover, setShowPopover] = useState(false);
  const [showPayoutDetails, setShowPayoutDetails] = useState(false);

  const [isVoted, setIsVoted] = useState<any>(null);
  const [isDownVoted, setIsDownVoted] = useState<any>(null);

  const [sliderValue, setSliderValue] = useState(1);
  const [amount, setAmount] = useState('0.00000');

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
      setPostType(_postType || PostTypes.POST);
      setContent(_content);
      setShowPayoutDetails(_showPayoutDetails || false);
      setShowPopover(true);
    },
  }));

  useEffect(() => {
    const activeVotes = content?.active_votes || [];
    const _isVoted = isVotedFunc(activeVotes, get(currentAccount, 'name'));
    const _isDownVoted = isDownVotedFunc(activeVotes, get(currentAccount, 'name'));

    setIsVoted(_isVoted && parseInt(_isVoted, 10) / 10000);
    setIsDownVoted(_isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1);
  }, [content]);

  useEffect(() => {
    _calculateEstimatedAmount();
  }, []);

  useEffect(() => {
    let _upvotePercent = 1;
    switch (postType) {
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
    setSliderValue(_upvotePercent);
    _calculateEstimatedAmount(_upvotePercent);
  }, [content, postType]);

  // Component Functions
  const _calculateEstimatedAmount = async (value: number = sliderValue) => {
    if (currentAccount && Object.entries(currentAccount).length !== 0) {
      setAmount(getEstimatedAmount(currentAccount, globalProps, value));
    }
  };

  const _upvoteContent = async () => {
    if (isVotingRef.current) {
      return;
    }

    if (!isDownVoted) {
      const _onVotingStart = onVotingStartRef.current;
      isVotingRef.current = true;

      try {
        _closePopover();
        _onVotingStart ? _onVotingStart(sliderValue) : null;

        _setUpvotePercent(sliderValue);

        const weight = sliderValue ? Math.trunc(sliderValue * 100) * 100 : 0;
        const _author = content?.author;
        const _permlink = content?.permlink;

        console.log(`casting up vote: ${weight}`);

        voteMutation.reset();
        await voteMutation.mutateAsync({
          author: _author,
          permlink: _permlink,
          weight,
          estimated: parseFloat(amount),
        });

        setIsVoted(!!sliderValue);
        _updateVoteCache(_author, _permlink, amount, false, sliderValue ? 'PUBLISHED' : 'DELETED');
      } catch (err) {
        const _author = content?.author;
        const _permlink = content?.permlink;

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

      try {
        _closePopover();
        _onVotingStart ? _onVotingStart(-sliderValue) : null;

        _setUpvotePercent(sliderValue);

        const weight = sliderValue ? Math.trunc(sliderValue * 100) * -100 : 0;
        const _author = content?.author;
        const _permlink = content?.permlink;

        console.log(`casting down vote: ${weight}`);

        voteMutation.reset();
        await voteMutation.mutateAsync({
          author: _author,
          permlink: _permlink,
          weight,
          estimated: parseFloat(amount),
        });

        setIsDownVoted(!!sliderValue);
        _updateVoteCache(_author, _permlink, amount, true, sliderValue ? 'PUBLISHED' : 'DELETED');
      } catch (err) {
        const _author = content?.author;
        const _permlink = content?.permlink;
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

    const percent = Math.floor(sliderValue * 10000 * (isDownvote ? -1 : 1));
    const rshares = calculateEstimatedRShares(currentAccount, percent) * (isDownvote ? -1 : 1);

    const curTime = new Date().getTime();
    updateVoteInQueryCaches(author, permlink, {
      votedAt: curTime,
      amount: amountNum,
      isDownvote,
      rshares,
      percent: Math.round(sliderValue * 100) * 100 * (isDownvote ? -1 : 1),
      incrementStep,
      voter: currentAccount.name,
      status,
    });
  };

  const _closePopover = () => {
    setShowPopover(false);

    setTimeout(() => {
      setShowPayoutDetails(false);
    }, 300);
  };

  if (!content) {
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
        from={sourceRef}
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
                trackStyle={styles.track}
                thumbStyle={styles.thumb}
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
