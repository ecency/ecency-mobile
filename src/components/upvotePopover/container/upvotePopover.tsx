import React, { Fragment, useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import get from 'lodash/get';

// Services and Actions
import {
  setCommentUpvotePercent,
  setPostUpvotePercent,
} from '../../../redux/actions/applicationActions';

// Utils
import { isVoted as isVotedFunc, isDownVoted as isDownVotedFunc } from '../../../utils/postParser';

// Component
import { updateVoteCache } from '../../../redux/actions/cacheActions';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { Rect } from 'react-native-modal-popover/lib/PopoverGeometry';
import { PostTypes } from '../../../constants/postTypes';

import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { Popover } from 'react-native-modal-popover';
import Slider from '@esteemapp/react-native-slider';

// Utils

import { getEstimatedAmount } from '../../../utils/vote';

// Components
import { Icon } from '../../icon';

// Services
import { setRcOffer, toastNotification } from '../../../redux/actions/uiAction';

// STEEM
import { vote } from '../../../providers/hive/dhive';

// Styles
import styles from '../children/upvoteStyles';

import { PointActivityIds } from '../../../providers/ecency/ecency.types';
import { useIntl } from 'react-intl';
import { useUserActivityMutation } from '../../../providers/queries';
import { PayoutDetailsContent } from '../children/payoutDetailsContent';
import { CacheStatus } from '../../../redux/reducers/cacheReducer';
import showLoginAlert from '../../../utils/showLoginAlert';
import { delay } from '../../../utils/editor';


interface Props { }
interface PopoverOptions {
  anchorRect: Rect,
  content: any,
  postType?: PostTypes,
  showPayoutDetails?: boolean,
  onVotingStart?:(isVoting:boolean) => void
}

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const UpvotePopover = forwardRef(({ }: Props, ref) => {

  const intl = useIntl();
  const dispatch = useAppDispatch();

  const userActivityMutation = useUserActivityMutation();

  const onVotingStartRef = useRef<any>(null);

  const isLoggedIn = useAppSelector(state => state.application.isLoggedIn);
  const postUpvotePercent = useAppSelector(state => state.application.postUpvotePercent);
  const commentUpvotePercent = useAppSelector(state => state.application.commentUpvotePercent);
  const pinCode = useAppSelector(state => state.application.pin);
  const currentAccount = useAppSelector(state => state.account.currentAccount);
  const globalProps = useAppSelector(state => state.account.globalProps);

  const [content, setContent] = useState<any>(null);
  const [postType, setPostType] = useState<PostTypes>(PostTypes.POST);
  const [anchorRect, setAcnhorRect] = useState<Rect | null>(null);
  const [showPayoutDetails, setShowPayoutDetails] = useState(false);

  const [isVoted, setIsVoted] = useState<any>(null);
  const [isDownVoted, setIsDownVoted] = useState<any>(null);

  const [sliderValue, setSliderValue] = useState(1);
  const [amount, setAmount] = useState('0.00000');
  const [upvotePercent, setUpvotePercent] = useState(1);

  useImperativeHandle(
    ref, () => ({
      showPopover: ({
        anchorRect: _anchorRect,
        content: _content,
        postType: _postType,
        showPayoutDetails: _showPayoutDetails,
        onVotingStart
      }: PopoverOptions) => {

        if (!isLoggedIn && !_showPayoutDetails) {
          showLoginAlert({ intl })
          return;
        }

        onVotingStartRef.current = onVotingStart
        setPostType(_postType || PostTypes.POST)
        setContent(_content);
        setShowPayoutDetails(_showPayoutDetails || false)
        setAcnhorRect(_anchorRect)
    
      }
    })
  )

  useEffect(() => {
    let _isMounted = true;
    const activeVotes = content?.active_votes || [];

    const _calculateVoteStatus = async () => {
      const _isVoted = await isVotedFunc(activeVotes, get(currentAccount, 'name'));
      const _isDownVoted = await isDownVotedFunc(activeVotes, get(currentAccount, 'name'));

      if (_isMounted) {
        setIsVoted(_isVoted && parseInt(_isVoted, 10) / 10000);
        setIsDownVoted(_isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1);
      }
    };

    _calculateVoteStatus();
    return () => { _isMounted = false };
  }, [content]);


  useEffect(() => {
    _calculateEstimatedAmount();
  }, []);



  useEffect(() => {
    if (postType === PostTypes.POST) {
      setUpvotePercent(postUpvotePercent);
    }
    if (postType === PostTypes.COMMENT) {
      setUpvotePercent(commentUpvotePercent);
    }
  }, [postUpvotePercent, commentUpvotePercent, postType]);



  useEffect(() => {
    const value = isVoted || isDownVoted ? 1 : upvotePercent <= 1 ? upvotePercent : 1;

    setSliderValue(value);
    _calculateEstimatedAmount(value);
  }, [upvotePercent]);



  // Component Functions
  const _calculateEstimatedAmount = async (value: number = sliderValue) => {
    if (currentAccount && Object.entries(currentAccount).length !== 0) {
      setAmount(getEstimatedAmount(currentAccount, globalProps, value));
    }
  };

  const _upvoteContent = async () => {

    if (!isDownVoted) {
      const _onVotingStart = onVotingStartRef.current; //keeping a reference of call to avoid mismatch in case back to back voting
      _closePopover();
      _onVotingStart ? _onVotingStart(1) : null;
      
      await delay(300)

      _setUpvotePercent(sliderValue);

      const weight = sliderValue ? Math.trunc(sliderValue * 100) * 100 : 0;
      const _author = content?.author;
      const _permlink = content?.permlink;

      console.log(`casting up vote: ${weight}`);
      _updateVoteCache(_author, _permlink, amount, false, CacheStatus.PENDING)

      vote(currentAccount, pinCode, _author, _permlink, weight)
        .then((response) => {
          console.log('Vote response: ', response);
          // record user points
          userActivityMutation.mutate({
            pointsTy: PointActivityIds.VOTE,
            transactionId: response.id,
          });

          if (!response || !response.id) {
            dispatch(
              toastNotification(
                intl.formatMessage(
                  { id: 'alert.something_wrong_msg' },
                  {
                    message: intl.formatMessage({
                      id: 'alert.invalid_response',
                    }),
                  },
                ),
              ),
            );

            return;
          }
          setIsVoted(!!sliderValue);
          _updateVoteCache(_author, _permlink, amount, false, CacheStatus.PUBLISHED);
        })
        .catch((err) => {
          _updateVoteCache(_author, _permlink, amount, false, CacheStatus.FAILED);
          _onVotingStart ? _onVotingStart(0) : null;
          if (
            err &&
            err.response &&
            err.response.jse_shortmsg &&
            err.response.jse_shortmsg.includes('wait to transact')
          ) {
            // when RC is not enough, offer boosting account
            setIsVoted(false);
            dispatch(setRcOffer(true));
          } else if (err && err.jse_shortmsg && err.jse_shortmsg.includes('wait to transact')) {
            // when RC is not enough, offer boosting account
            setIsVoted(false);
            dispatch(setRcOffer(true));
          } else {
            // // when voting with same percent or other errors
            let errMsg = '';
            if (err.message && err.message.indexOf(':') > 0) {
              errMsg = err.message.split(': ')[1];
            } else {
              errMsg = err.jse_shortmsg || err.error_description || err.message;
            }
            dispatch(
              toastNotification(
                intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: errMsg }),
              ),
            );
          }
        });
    } else {
      setSliderValue(1);
      setIsDownVoted(false);
    }
  };

  const _downvoteContent = async () => {
    const _onVotingStart = onVotingStartRef.current; //keeping a reference of call to avoid mismatch in case back to back voting
    if (isDownVoted) {
      _closePopover();
      _onVotingStart ? _onVotingStart(-1) : null;
      
      await delay(300)
      
      _setUpvotePercent(sliderValue);

      const weight = sliderValue ? Math.trunc(sliderValue * 100) * -100 : 0;
      const _author = content?.author;
      const _permlink = content?.permlink;

      console.log(`casting down vote: ${weight}`);
      _updateVoteCache(_author, _permlink, amount, true, CacheStatus.PENDING);

      vote(currentAccount, pinCode, _author, _permlink, weight)
        .then((response) => {
          // record usr points
          userActivityMutation.mutate({
            pointsTy: PointActivityIds.VOTE,
            transactionId: response.id,
          });
          setIsVoted(!!sliderValue);
          _updateVoteCache(_author, _permlink, amount, true, CacheStatus.PUBLISHED);
        })
        .catch((err) => {
          dispatch(
            toastNotification(
              intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: err.message }),
            ),
          );
          _updateVoteCache(_author, _permlink, amount, true, CacheStatus.FAILED);
          setIsVoted(false);
          _onVotingStart ? _onVotingStart(0) : null;
        });


    } else {
      setSliderValue(1);
      setIsDownVoted(true);
    }
  };




  const _setUpvotePercent = (value) => {
    if (value) {
      if (postType === PostTypes.POST) {
        dispatch(setPostUpvotePercent(value));
      }
      if (postType === PostTypes.COMMENT) {
        dispatch(setCommentUpvotePercent(value));
      }
    }
  };


  const _updateVoteCache = (author, permlink, amount, isDownvote, status) => {
    // do all relevant processing here to show local upvote
    const amountNum = parseFloat(amount);

    let incrementStep = 0;
    if (!isVoted && !isDownVoted) {
      incrementStep = 1;
    }

    // update redux
    const postPath = `${author || ''}/${permlink || ''}`;
    const curTime = new Date().getTime();
    const vote = {
      votedAt: curTime,
      amount: amountNum,
      isDownvote,
      incrementStep,
      voter:currentAccount.username,
      expiresAt: curTime + 30000,
      status,
    };
    dispatch(updateVoteCache(postPath, vote));
  };


  const _closePopover = () => {
    setAcnhorRect(null);
    setTimeout(() => {
      setShowPayoutDetails(false);
    }, 300)
  }

  if (!content) {
    return null;
  }



  let iconName = 'upcircleo';
  let downVoteIconName = 'downcircleo';


  const _percent = `${isDownVoted ? '-' : ''}${(sliderValue * 100).toFixed(0)}%`;
  const _amount = `$${amount}`;

  const sliderColor = isDownVoted ? '#ec8b88' : '#357ce6';



  return (
    <Fragment>
      <Popover
        contentStyle={showPayoutDetails ? styles.popoverDetails : styles.popoverSlider}
        arrowStyle={showPayoutDetails ? styles.arrow : styles.hideArrow}
        backgroundStyle={styles.overlay}
        visible={!!anchorRect}
        onClose={() => {
          _closePopover();
        }}
        fromRect={anchorRect || { x: 0, y: 0, width: 0, height: 0 }}
        placement="top"
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.popoverWrapper}>
          {showPayoutDetails ? (
            <PayoutDetailsContent content={content} />
          ) : (
            <Fragment>
              <TouchableOpacity
                onPress={_upvoteContent}
                style={styles.upvoteButton}
              >
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
                minimumValue={0.01}
                maximumValue={1}
                value={sliderValue}
                onValueChange={(value) => {
                  setSliderValue(value);
                  _calculateEstimatedAmount(value);
                }}
              />
              <Text style={styles.percent}>{_percent}</Text>
              <TouchableOpacity
                onPress={_downvoteContent}
                style={styles.upvoteButton}
              >
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
