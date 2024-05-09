import React from 'react';
import { View, Text } from 'react-native';

import styles from '../styles/pollHeader.styles';

import { Icon, PopoverWrapper } from '../../';
import { getTimeFromNow } from '../../../utils/time';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { PostMetadata } from '../../../providers/hive/hive.types';

interface PollHeaderProps {
    metadata: PostMetadata
    expired: boolean;
}

export const PollHeader = ({ metadata, expired }: PollHeaderProps) => {
    const intl = useIntl();

    const _endDate = new Date(metadata.end_time * 1000);
    const formattedEndTime = expired
        ? intl.formatMessage({ id: "post_poll.ended" })
        : intl.formatMessage({ id: "post_poll.ends" }, { inTime: getTimeFromNow(_endDate) })


    const _ageLimit = metadata?.filters?.account_age || 0;

    return (
        <View>
            <View style={styles.headerWrapper}>
                <Text style={styles.question}>{metadata.question} </Text>
                <PopoverWrapper text={_endDate.toString()} >
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText} >{formattedEndTime}</Text>
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
            {!!_ageLimit && (
                <Text style={styles.subText}>
                    {intl.formatMessage({ id: "post_poll.age_limit" }, { days: _ageLimit })}
                </Text>
            )}
        </View>

    );
};
