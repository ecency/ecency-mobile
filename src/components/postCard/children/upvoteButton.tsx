import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAppSelector } from '../../../hooks';
import { FormattedCurrency } from '../../formatedElements';
import Icon from '../../icon';
import styles from '../styles/children.styles';
import { useLayoutState } from '@shopify/flash-list';

interface UpvoteButtonProps {
  content: any;
  activeVotes: any[];
  isShowPayoutValue?: boolean;
  boldPayout?: boolean;
  onUpvotePress: (sourceRef: Ref<any>, onVotingStart: (status: number) => void) => void;
  onPayoutDetailsPress: (anchorRef: Ref<any>) => void;
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

  const [isVoted, setIsVoted] = useLayoutState(content.isUpVoted || false)
  const [isDownVoted, setIsDownVoted] = useLayoutState(content.isDownVoted || false)

  //update voted state if vote status changes changes
  useEffect(() => {
    if (content.isUpVoted !== isVoted) {
      setIsVoted(content.isUpVoted);
    }
    if (content.isDownVoted !== isDownVoted) {
      setIsDownVoted(content.isDownVoted);
    }
  }, [content.isUpVoted, content.isDownVoted])


  const _onPress = () => {

    const _onVotingStart = (status) => {
      if (status > 0) {
        setIsVoted(true);
      } else if (status < 0) {
        setIsDownVoted(true);
      } else {
        setIsVoted(false);
        setIsDownVoted(false);
      }
    };

    onUpvotePress(upvoteRef, _onVotingStart);
  };

  const _onDetailsPress = () => {
    onPayoutDetailsPress(detailsRef);
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
        <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }}>
          <Icon
            style={[styles.upvoteIcon, isDownVoted && { color: '#ec8b88' }]}
            active={!currentAccount}
            iconType={iconType}
            name={isDownVoted ? downVoteIconName : iconName}
          />
        </View>
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
