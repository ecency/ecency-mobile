import React, { PureComponent, Fragment } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { injectIntl } from 'react-intl';

// Constants

// Components
import { ContainerHeader } from '../../containerHeader';
import { FilterBar } from '../../filterBar';
import NotificationLine from '../../notificationLine';
import { ListPlaceHolder } from '../../basicUIElements';

// Utils
import { isToday, isYesterday, isThisWeek, isThisMonth } from '../../../utils/time';

// Styles
import styles from './notificationStyles';

class NotificationView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */
  constructor(props) {
    super(props);
    this.state = {
      // TODO: Remove filters from local state.
      filters: [
        { key: 'activities', value: 'ALL ACTIVITIES' },
        { key: 'votes', value: 'VOTES' },
        { key: 'replies', value: 'REPLIES' },
        { key: 'mentions', value: 'MENTIONS' },
        { key: 'follows', value: 'FOLLOWS' },
        { key: 'reblogs', value: 'REBLOGS' },
        { key: 'transfers', value: 'TRANSFERS' },
      ],
      selectedFilter: null,
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleOnDropdownSelect = index => {
    const { getActivities, changeSelectedFilter } = this.props;
    const { filters } = this.state;

    this.setState({ selectedFilter: filters[index].key });
    changeSelectedFilter(filters[index].key);
    getActivities(filters[index].key, false);
  };

  _renderList = data => {
    const { navigateToNotificationRoute } = this.props;

    return (
      <FlatList
        data={data}
        initialNumToRender={data && data.length}
        maxToRenderPerBatch={data && data.length}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotificationLine
            notification={item}
            handleOnPressNotification={navigateToNotificationRoute}
          />
        )}
      />
    );
  };

  _renderFooterLoading = () => {
    const { loading, notifications } = this.props;
    if (loading && notifications.length > 0) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator animating size="large" />
        </View>
      );
    }
    return null;
  };

  _getNotificationsArrays = () => {
    const { notifications, intl } = this.props;

    if (!notifications && notifications.length < 1) return null;

    const notificationArray = [
      {
        title: intl.formatMessage({
          id: 'notification.recent',
        }),
        notifications: [],
      },
      {
        title: intl.formatMessage({
          id: 'notification.yesterday',
        }),
        notifications: [],
      },
      {
        title: intl.formatMessage({
          id: 'notification.this_week',
        }),
        notifications: [],
      },
      {
        title: intl.formatMessage({
          id: 'notification.this_month',
        }),
        notifications: [],
      },
      {
        title: intl.formatMessage({
          id: 'notification.older_then',
        }),
        notifications: [],
      },
    ];

    notifications.forEach(item => {
      const listIndex = this._getTimeListIndex(item.timestamp);

      notificationArray[listIndex].notifications.push(item);
    });

    return notificationArray.filter(item => item.notifications.length > 0);
  };

  _getTimeListIndex = timestamp => {
    if (isToday(timestamp)) return 0;

    if (isYesterday(timestamp)) return 1;

    if (isThisWeek(timestamp)) return 2;

    if (isThisMonth(timestamp)) return 3;

    return 4;
  };

  _getActivityIndicator = () => (
    <View style={styles.loading}>
      <ActivityIndicator animating size="large" />
    </View>
  );

  render() {
    const {
      readAllNotification,
      getActivities,
      isNotificationRefreshing,
      isDarkTheme,
    } = this.props;
    const { filters, selectedFilter } = this.state;
    const _notifications = this._getNotificationsArrays();

    return (
      <View style={styles.container}>
        <FilterBar
          dropdownIconName="arrow-drop-down"
          options={filters.map(item => item.value)}
          defaultText="ALL ACTIVITIES"
          onDropdownSelect={this._handleOnDropdownSelect}
          rightIconName="check"
          rightIconType="MaterialIcons"
          onRightIconPress={readAllNotification}
        />
        {_notifications.length === 0 ? (
          <ListPlaceHolder />
        ) : (
          <FlatList
            data={_notifications}
            refreshing={isNotificationRefreshing}
            onRefresh={() => getActivities()}
            keyExtractor={item => item.title}
            onEndReached={() => getActivities(selectedFilter, true)}
            ListFooterComponent={this._renderFooterLoading}
            refreshControl={
              <RefreshControl
  refreshing={isNotificationRefreshing}
  progressBackgroundColor="#357CE6"
  tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
  titleColor="#fff"
  colors={['#fff']}
/>
            }
            renderItem={({ item, index }) => (
              <Fragment>
                <ContainerHeader
                  hasSeperator={index !== 0}
                  isBoldTitle
                  title={item.title}
                  key={item.title}
                />
                {this._renderList(item.notifications)}
              </Fragment>
            )}
          />
        )}
      </View>
    );
  }
}

export default injectIntl(NotificationView);
