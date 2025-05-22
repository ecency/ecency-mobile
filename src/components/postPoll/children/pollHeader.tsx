import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import styles from '../styles/pollHeader.styles';

import { Icon, PopoverWrapper } from '../..';
import { getTimeFromNow } from '../../../utils/time';
import { PollPreferredInterpretation, PostMetadata } from '../../../providers/hive/hive.types';
import { getCommunityTitle } from '../../../providers/hive/dhive';

interface PollHeaderProps {
  metadata: PostMetadata;
  expired: boolean;
  compactView?: boolean;
}

export const PollHeader = ({ metadata, expired, compactView }: PollHeaderProps) => {
  const intl = useIntl();

  // cache community names if community restriction is applicable
  const [communityNames, setCommunityNames] = useState<string[]>([]);
  useEffect(() => {
    if (!metadata.community_membership) {
      setCommunityNames([]);
      return;
    }

    Promise.all(metadata.community_membership.map(getCommunityTitle))
      .then(setCommunityNames)
      .catch((error) => {
        console.error('Failed to fetch community names:', error);
        setCommunityNames([]);
      });
  }, [metadata.community_membership]);

  // format end time
  const _endDate = new Date(metadata.end_time * 1000);
  const formattedEndTime = expired
    ? intl.formatMessage({ id: 'post_poll.ended' })
    : intl.formatMessage({ id: 'post_poll.ends' }, { inTime: getTimeFromNow(_endDate) });

  // accumulate bullets points data
  const _ageLimit = metadata?.filters?.account_age || 0;
  const _interpretationToken =
    metadata?.preferred_interpretation === PollPreferredInterpretation.TOKENS || false;
  const _maxChoicesVotable = metadata?.max_choices_voted || 1;
  const _token = metadata.token || 'HIVE:HP';
  const _isCommunityRestricted =
    !!metadata.community_membership && metadata.community_membership?.length > 0;

  const _renderSubText = (text) => <Text style={styles.subText}>{text}</Text>;

  return (
    <View>
      <View style={[styles.headerWrapper, compactView && styles.compactHeaderExtension]}>
        <Text style={styles.question}>{metadata.question?.trim()}</Text>
        <PopoverWrapper text={_endDate.toString()}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formattedEndTime}</Text>
            <Icon
              iconType="MaterialCommunityIcons"
              style={styles.clockIcon}
              name="clock-outline"
              color={EStyleSheet.value('$primaryDarkText')}
              size={20}
            />
          </View>
        </PopoverWrapper>
      </View>
      {!!_ageLimit &&
        _renderSubText(intl.formatMessage({ id: 'post_poll.age_limit' }, { days: _ageLimit }))}
      {_interpretationToken &&
        _renderSubText(
          intl.formatMessage({ id: 'post_poll.interpretation_token' }, { token: _token }),
        )}
      {_maxChoicesVotable > 1 &&
        _renderSubText(
          intl.formatMessage({ id: 'post_poll.max_choices' }, { choices: _maxChoicesVotable }),
        )}
      {_isCommunityRestricted &&
        _renderSubText(
          intl.formatMessage(
            { id: 'post_poll.community_restricted' },
            { communities: communityNames.join(', ') },
          ),
        )}
    </View>
  );
};
