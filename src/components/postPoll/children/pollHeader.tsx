import React from 'react';
import { View, Text } from 'react-native';

import styles from '../styles/pollHeader.styles';

import { Icon, PopoverWrapper } from '../../';
import { getTimeFromNow } from '../../../utils/time';
import EStyleSheet from 'react-native-extended-stylesheet';

interface PollHeaderProps {

    question: string;
    endTime: number
}

export const PollHeader = ({ question, endTime }: PollHeaderProps) => {

    const _endDate = new Date(endTime * 1000);
    const formattedEndTime = 'Ends ' + getTimeFromNow(_endDate)

    return (
        <View style={styles.headerWrapper}>
            <Text style={styles.question}>{question} </Text>
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
    );
};
