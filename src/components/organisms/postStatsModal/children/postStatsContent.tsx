import React from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

import { MainButton } from '../../..';
import styles from '../styles/postStatsModal.styles';
import {  usePostStatsQuery } from '../../../../providers/queries';
import { StatsItem, StatsPanel } from '../../../../components/statsPanel';

interface QuickProfileContentProps {
    urlPath: string;
    onPromotePress: () => void
}

export const PostStatsContent = ({ urlPath, onPromotePress }: QuickProfileContentProps) => {
    const intl = useIntl();
    const statsQuery = usePostStatsQuery(urlPath);


    const statsData1 = [
        { label: intl.formatMessage({ id: 'stats.viewers' }), value: statsQuery.data?.visitors },
        { label: intl.formatMessage({ id: 'stats.pageviews' }), value: statsQuery.data?.pageviews },

    ] as StatsItem[];

    const statsData2 = [
        { label: intl.formatMessage({ id: 'stats.duration' }), value: (statsQuery.data?.visit_duration / 1000) },
    ]


    return (
        <View style={styles.modalStyle}>
            <StatsPanel data={statsData2} intermediate={statsQuery.isLoading} />
            <StatsPanel data={statsData1} intermediate={statsQuery.isLoading} />

            <MainButton
                style={styles.button}
                text={intl.formatMessage({ id: 'stats.promote' })}
                onPress={onPromotePress}
            />
        </View>
    );
};
