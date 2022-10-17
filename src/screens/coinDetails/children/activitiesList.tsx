import React, { ComponentType, JSXElementConstructor, ReactElement } from 'react';
import { useIntl } from 'react-intl';
import { SectionList, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { Transaction } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { CoinActivity } from '../../../redux/reducers/walletReducer';
import styles from './children.styles';

interface ActivitiesListProps {
  header: ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>>;
  pendingActivities: CoinActivity[];
  completedActivities: CoinActivity[];
  refreshing: boolean;
  loading: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
}

const ActivitiesList = ({
  header,
  loading,
  refreshing,
  completedActivities,
  pendingActivities,
  onEndReached,
  onRefresh,
}: ActivitiesListProps) => {
  const intl = useIntl();

  const isDarkTheme = useAppSelector((state) => state.ui.isDarkTheme);

  const _renderActivityItem = ({ item, index }) => {
    return <Transaction item={item} index={index} />;
  };

  const sections = [];

  if (pendingActivities && pendingActivities.length) {
    sections.push({
      title: intl.formatMessage({ id: 'wallet.pending_requests' }),
      data: pendingActivities,
    });
  }

  sections.push({
    title: intl.formatMessage({ id: 'wallet.activities' }),
    data: completedActivities || [],
  });

  const _refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      progressBackgroundColor="#357CE6"
      tintColor={isDarkTheme ? '#357ce6' : '#96c0ff'}
      titleColor="#fff"
      colors={['#fff']}
    />
  );

  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      sections={sections}
      renderItem={_renderActivityItem}
      keyExtractor={(item, index) => `activity_item_${index}_${item.created}`}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.textActivities}>{title}</Text>
      )}
      ListFooterComponent={
        loading && <ActivityIndicator style={styles.activitiesFooterIndicator} />
      }
      ListHeaderComponent={header}
      refreshControl={_refreshControl}
      onEndReached={() => {
        onEndReached();
      }}
    />
  );
};

export default ActivitiesList;
