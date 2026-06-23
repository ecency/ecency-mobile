import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useAppSelector } from '../../../hooks';
import { FormattedCurrency } from '../../formatedElements';
import Icon from '../../icon';
import styles from '../styles/children.styles';
import { selectCurrentAccount } from '../../../redux/selectors';

interface UpvoteButtonProps {
  content: any;
  isShowPayoutValue?: boolean;
  boldPayout?: boolean;
  onUpvotePress: (sourceRef: Ref<any>, onVotingStart: (status: number) => void) => void;
  onPayoutDetailsPress: (anchorRef: Ref<any>) => void;
}

export const UpvoteButton = ({
  content,
  isShowPayoutValue,
  boldPayout,
  onUpvotePress,
  onPayoutDetailsPress,
}: UpvoteButtonProps) => {
  const intl = useIntl();
  const upvoteRef = useRef(null);
  const detailsRef = useRef(null);

  const currentAccount = useAppSelector(selectCurrentAccount);

  const [isVoted, setIsVoted] = useState(!!content.isUpVoted);
  const [isDownVoted, setIsDownVoted] = useState(!!content.isDownVoted);

  // update voted state if vote status changes
  useEffect(() => {
    const upVoted = !!content.isUpVoted;
    const downVoted = !!content.isDownVoted;
    if (upVoted !== isVoted) {
      setIsVoted(upVoted);
    }
    if (downVoted !== isDownVoted) {
      setIsDownVoted(downVoted);
    }
  }, [content.isUpVoted, content.isDownVoted]);

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
  // Always render the payout value to match the web client (entry-payout always shows
  // the amount, including $0.000, on posts, comments and waves alike). Coerce an
  // absent/NaN payout to 0 so FormattedCurrency never receives undefined (which would
  // render "$ NaN"). When an entry genuinely earns nothing the real value is 0.000, so
  // we no longer hide the chip — that mirrors the website and avoids dropping real
  // payouts on entries whose total only looks zero (see parsePost numeric-payout
  // fallback for search/RPC-shaped entries).
  const _payoutValue = Number(_shownPayout) || 0;

  let iconName = 'upcircleo';
  const iconType = 'AntDesign';
  let downVoteIconName = 'downcircleo';

  if (isVoted) {
    iconName = 'upcircle';
  }

  if (isDownVoted) {
    downVoteIconName = 'downcircle';
  }

  // Give the vote control a screen-reader name + state. The icon alone carries no
  // accessible label, so VoiceOver/TalkBack users couldn't find or operate it.
  const voteAccessibilityLabel = isVoted
    ? intl.formatMessage({ id: 'post.upvoted' })
    : isDownVoted
    ? intl.formatMessage({ id: 'post.downvoted' })
    : intl.formatMessage({ id: 'post.upvote' });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={upvoteRef}
        onPress={_onPress}
        style={styles.upvoteButton}
        accessibilityRole="button"
        accessibilityLabel={voteAccessibilityLabel}
        accessibilityHint={intl.formatMessage({ id: 'post.upvote_hint' })}
        accessibilityState={{ selected: isVoted || isDownVoted }}
      >
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
          <TouchableOpacity
            ref={detailsRef}
            onPress={_onDetailsPress}
            accessibilityRole="button"
            accessibilityLabel={intl.formatMessage({ id: 'post.payout_details' })}
          >
            <Text
              style={[
                styles.payoutValue,
                isDeclinedPayout && styles.declinedPayout,
                boldPayout && styles.boldText,
              ]}
            >
              <FormattedCurrency value={_payoutValue} />
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
