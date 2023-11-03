import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NativeModules, Text, TouchableOpacity, View, findNodeHandle } from 'react-native';
import { Rect } from 'react-native-modal-popover/lib/PopoverGeometry';
import { useAppSelector } from '../../../hooks';
import { isDownVoted as isDownVotedFunc, isVoted as isVotedFunc } from '../../../utils/postParser';
import { FormattedCurrency } from '../../formatedElements';
import Icon from '../../icon';
import styles from './children.styles';

interface UpvoteButtonProps {
  content: any;
  activeVotes: any[];
  isShowPayoutValue?: boolean;
  boldPayout?: boolean;
  onUpvotePress: (anchorRect: Rect, onVotingStart: (status: number) => void) => void;
  onPayoutDetailsPress: (anchorRef: Rect) => void;
}

export const UpvoteButton = ({
  content,
  activeVotes,
  isShowPayoutValue,
  boldPayout,
  onUpvotePress,
  onPayoutDetailsPress,
}: UpvoteButtonProps) => {
  const upvoteRef = useRef(null);
  const detailsRef = useRef(null);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [isVoted, setIsVoted] = useState<any>(null);
  const [isDownVoted, setIsDownVoted] = useState<any>(null);

  useEffect(() => {
    _calculateVoteStatus();
  }, [activeVotes]);

  const _calculateVoteStatus = useCallback(async () => {
    // TODO: do this heavy lifting during parsing or react-query/cache response
    const _isVoted = await isVotedFunc(activeVotes, currentAccount?.name);
    const _isDownVoted = await isDownVotedFunc(activeVotes, currentAccount?.name);

    setIsVoted(_isVoted && parseInt(_isVoted, 10) / 10000);
    setIsDownVoted(_isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1);
  }, [activeVotes]);

  const _getRectFromRef = (ref: any, callback: (anchorRect: Rect, onVotingStart?) => void) => {
    const handle = findNodeHandle(ref.current);
    if (handle) {
      NativeModules.UIManager.measure(handle, (x0, y0, width, height, x, y) => {
        const anchorRect: Rect = { x, y, width, height };
        callback(anchorRect);
      });
    }
  };

  const _onPress = () => {
    const _onVotingStart = (status) => {
      if (status > 0) {
        setIsVoted(true);
      } else if (status < 0) {
        setIsDownVoted(true);
      } else {
        _calculateVoteStatus();
      }
    };
    _getRectFromRef(upvoteRef, (rect) => {
      onUpvotePress(rect, _onVotingStart);
    });
  };

  const _onDetailsPress = () => {
    _getRectFromRef(detailsRef, onPayoutDetailsPress);
  };

  const isDeclinedPayout = content?.is_declined_payout;
  const totalPayout = content?.total_payout;
  const maxPayout = content?.max_payout;

  const payoutLimitHit = totalPayout >= maxPayout;
  const _shownPayout = payoutLimitHit && maxPayout > 0 ? maxPayout : totalPayout;

  let iconName = 'upcircleo';
  const iconType = 'AntDesign';
  let downVoteIconName = 'downcircleo';

  if (isVoted) {
    iconName = 'upcircle';
  }

  if (isDownVoted) {
    downVoteIconName = 'downcircle';
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity ref={upvoteRef} onPress={_onPress} style={styles.upvoteButton}>
        {/* <Fragment>
                    {isVoting ? (
                        <View style={{ width: 19 }}>
                            <PulseAnimation
                                color="#357ce6"
                                numPulses={1}
                                diameter={20}
                                speed={100}
                                duration={1500}
                                isShow={!isVoting}
                            />
                        </View>
                    ) : ( */}
        <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }}>
          <Icon
            style={[styles.upvoteIcon, isDownVoted && { color: '#ec8b88' }]}
            active={!currentAccount}
            iconType={iconType}
            name={isDownVoted ? downVoteIconName : iconName}
          />
        </View>
        {/* )}
                </Fragment> */}
      </TouchableOpacity>
      <View style={styles.payoutTextButton}>
        {isShowPayoutValue && (
          <TouchableOpacity ref={detailsRef} onPress={_onDetailsPress}>
            <Text
              style={[
                styles.payoutValue,
                isDeclinedPayout && styles.declinedPayout,
                boldPayout && styles.boldText,
              ]}
            >
              <FormattedCurrency value={_shownPayout || '0.000'} />
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
