import React from 'react';
import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainButton } from '../../..';
import styles from '../styles/postStatsModal.styles';
import { usePostStatsQuery } from '../../../../providers/queries';
import { StatsItem, StatsPanel } from '../../../statsPanel';
import { DeviceStats } from './deviceStats';

interface QuickProfileContentProps {
  urlPath: string;
  onPromotePress: () => void;
}

export const PostStatsContent = ({ urlPath, onPromotePress }: QuickProfileContentProps) => {
  const intl = useIntl();
  const statsQuery = usePostStatsQuery(urlPath);

  const insets = useSafeAreaInsets();

  const _durationValue = Math.floor((statsQuery.data?.visit_duration || 0) / 1000);
  const statsData1 = [
    { label: intl.formatMessage({ id: 'stats.viewers' }), value: statsQuery.data?.visitors },
    { label: intl.formatMessage({ id: 'stats.pageviews' }), value: statsQuery.data?.pageviews },
    { label: intl.formatMessage({ id: 'stats.duration' }), value: _durationValue },
  ] as StatsItem[];

  const _renderActionPanel = () => {
    const _panelStyle = { marginBottom: insets.bottom > 0 ? 0 : 16 };

    return (
      <Animated.View entering={FadeInDown.delay(500)} style={_panelStyle}>
        <Text style={styles.promoteText}>
          {intl.formatMessage({ id: 'stats.promote_title' })}
          <Text style={styles.promoteSubText}>
            {intl.formatMessage({ id: 'stats.promote_message' })}
          </Text>
        </Text>

        <MainButton
          style={styles.button}
          text={intl.formatMessage({ id: 'stats.promote' })}
          onPress={onPromotePress}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.modalStyle}>
      <StatsPanel data={statsData1} intermediate={statsQuery.isLoading} />
      <DeviceStats urlPath={urlPath} />

      {_renderActionPanel()}
    </View>
  );
};
