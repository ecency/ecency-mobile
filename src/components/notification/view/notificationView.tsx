import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, FlatList, Text, View, RefreshControl } from 'react-native';
// Constants

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { NotificationLine } from '../..';
import { ListPlaceHolder } from '../../basicUIElements';
import { FilterBar } from '../../filterBar';

// Styles
import globalStyles from '../../../globalStyles';
import { useAppSelector } from '../../../hooks';
import { selectIsDarkTheme } from '../../../redux/selectors';
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
  listRef?: React.RefObject<FlatList>;
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
  listRef: externalListRef,
}: Props) => {
  const intl = useIntl();

  const internalListRef = useRef<FlatList>(null);
  const listRef = externalListRef || internalListRef;

  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Prevent onEndReached from firing on mount before user scrolls
  const onEndReachedCalledDuringMomentum = useRef(true);

  const _handleOnDropdownSelect = async (index) => {
    const _selectedFilter = FILTERS[index].key;
    setSelectedIndex(index);
    changeSelectedFilter(_selectedFilter, index);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    // Reset momentum flag when filter changes to prevent immediate fetch
    onEndReachedCalledDuringMomentum.current = true;
  };

  const _handleOnEndReached = () => {
    // Only trigger load more if user has actually scrolled (momentum began)
    if (!onEndReachedCalledDuringMomentum.current) {
      getActivities(true);
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  const _handleMomentumScrollBegin = () => {
    // User started scrolling, allow next onEndReached to trigger
    onEndReachedCalledDuringMomentum.current = false;
  };

  const _renderFooterLoading = () => {
    if (isLoading && notifications.length > 0) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} animating />
        </View>
      );
    }
    return null;
  };

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

      <FlatList
        ref={listRef}
        data={notifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={_handleOnEndReached}
        onEndReachedThreshold={0.3}
        onMomentumScrollBegin={_handleMomentumScrollBegin}
        ListFooterComponent={_renderFooterLoading}
        ListEmptyComponent={
          isLoading || isNotificationRefreshing ? (
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
      />
    </View>
  );
};

export default NotificationView;
