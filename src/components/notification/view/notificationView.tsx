import React, { useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, SectionList, Text, View, RefreshControl } from 'react-native';
// Constants

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { NotificationLine } from '../..';
import { ListPlaceHolder } from '../../basicUIElements';
import { ContainerHeader } from '../../containerHeader';
import { FilterBar } from '../../filterBar';

// Utils
import { isLastWeek, isThisMonth, isThisWeek } from '../../../utils/time';

// Styles
import globalStyles from '../../../globalStyles';
import { useAppSelector } from '../../../hooks';
import styles from './notificationStyles';

const FILTERS = [
  { key: 'activities', value: 'ALL' },
  { key: 'replies', value: 'REPLIES' },
  { key: 'mentions', value: 'MENTIONS' },
];

interface Props {
  notifications: any[];
  isLoading: boolean;
  isNotificationRefreshing: boolean;
  globalProps: any;
  handleOnUserPress: () => void;
  readAllNotification: () => void;
  getActivities: () => void;
  changeSelectedFilter: () => void;
  navigateToNotificationRoute: () => void;
}

const NotificationView = ({
  notifications,
  isLoading,
  isNotificationRefreshing,
  globalProps,
  handleOnUserPress,
  readAllNotification,
  getActivities,
  changeSelectedFilter,
  navigateToNotificationRoute,
}: Props) => {
  const intl = useIntl();

  const listRef = useRef<SectionList>(null);

  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const _notifications = useMemo(
    () => _getSectionedNotifications(notifications, intl),
    [notifications],
  );

  const _handleOnDropdownSelect = async (index) => {
    const _selectedFilter = FILTERS[index].key;
    setSelectedIndex(index);
    changeSelectedFilter(_selectedFilter, index);
    listRef.current?.scrollToLocation({ itemIndex: 0, sectionIndex: 0, animated: false });
  };

  const _renderFooterLoading = () => {
    if (isLoading) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} animating />
        </View>
      );
    }
    return null;
  };

  const _renderSectionHeader = ({ section: { title, index } }) => (
    <ContainerHeader hasSeperator={index !== 0} isBoldTitle title={title} key={title} />
  );

  const _renderItem = ({ item }) => (
    <NotificationLine
      notification={item}
      handleOnPressNotification={navigateToNotificationRoute}
      handleOnUserPress={() => {
        handleOnUserPress(item.source);
      }}
      globalProps={globalProps}
    />
  );

  return (
    <View style={styles.container}>
      <FilterBar
        dropdownIconName="arrow-drop-down"
        options={FILTERS.map((item) =>
          intl.formatMessage({ id: `notification.${item.key}` }).toUpperCase(),
        )}
        defaultText="ALL"
        onDropdownSelect={_handleOnDropdownSelect}
        rightIconName="playlist-add-check"
        rightIconType="MaterialIcons"
        selectedOptionIndex={selectedIndex}
        onRightIconPress={readAllNotification}
      />

      <SectionList
        ref={listRef}
        sections={_notifications}
        // data={_notifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={() => getActivities(true)}
        onEndReachedThreshold={0.3}
        ListFooterComponent={_renderFooterLoading}
        ListEmptyComponent={
          isNotificationRefreshing ? (
            <ListPlaceHolder />
          ) : (
            <Text style={globalStyles.hintText}>
              {intl.formatMessage({ id: 'notification.noactivity' })}
            </Text>
          )
        }
        contentContainerStyle={styles.listContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isNotificationRefreshing}
            onRefresh={() => getActivities()}
            progressBackgroundColor="#357CE6"
            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
            titleColor="#fff"
            colors={['#fff']}
          />
        }
        renderItem={_renderItem}
        renderSectionHeader={_renderSectionHeader}
      />
    </View>
  );
};

export default NotificationView;

const _getSectionedNotifications = (notifications: any[], intl: any) => {
  if (!notifications && notifications.length < 1) {
    return null;
  }

  const notificationArray = [
    {
      title: intl.formatMessage({
        id: 'notification.recent',
      }),
      data: [],
    },
    {
      title: intl.formatMessage({
        id: 'notification.yesterday',
      }),
      data: [],
    },
    {
      title: intl.formatMessage({
        id: 'notification.this_week',
      }),
      data: [],
    },
    {
      title: intl.formatMessage({
        id: 'notification.last_week',
      }),
      data: [],
    },
    {
      title: intl.formatMessage({
        id: 'notification.this_month',
      }),
      data: [],
    },
    {
      title: intl.formatMessage({
        id: 'notification.older_then',
      }),
      data: [],
    },
  ];

  // let sectionIndex = -1;
  notifications.forEach((item) => {
    const timeIndex = _getTimeListIndex(item.gk);
    notificationArray[timeIndex].data.push(item);
  });

  return notificationArray
    .filter((item) => item.data.length > 0)
    .map((item, index) => {
      item.index = index;
      return item;
    });
};

const _getTimeListIndex = (gk: string) => {
  if (gk === 'Recent' || gk.match(/\d+\s*hours?/)) {
    return 0;
  }

  if (gk === 'Yesterday') {
    return 1;
  }

  if (isThisWeek(gk)) {
    return 2;
  }

  if (isLastWeek(gk)) {
    return 3;
  }

  if (isThisMonth(gk)) {
    return 4;
  }

  return 5;
};
