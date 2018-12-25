import React, { PureComponent, Fragment } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { injectIntl } from 'react-intl';

// Constants

// Components
import { ContainerHeader } from '../../containerHeader';
import { FilterBar } from '../../filterBar';
import NotificationLine from '../../notificationLine';

// Utils
import {
  isToday, isYesterday, isThisWeek, isThisMonth,
} from '../../../utils/time';

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
      filters: [
        { key: 'activities', value: 'ALL ACTIVITIES' },
        { key: 'votes', value: 'VOTES' },
        { key: 'replies', value: 'REPLIES' },
        { key: 'mentions', value: 'MENTIONS' },
        { key: 'follows', value: 'FOLLOWS' },
        { key: 'reblogs', value: 'REBLOGS' },
      ],
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleOnDropdownSelect = (index) => {
    const { getActivities } = this.props;
    const { filters } = this.state;

    getActivities(filters[index].key);
  };

  render() {
    const {
      notifications, intl, navigateToNotificationRoute, readAllNotification,
    } = this.props;
    const { filters } = this.state;
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const thisMonth = [];
    const olderThenMonth = [];

    notifications.map((item) => {
      if (isToday(item.timestamp)) {
        today.push(item);
      } else if (isYesterday(item.timestamp)) {
        yesterday.push(item);
      } else if (isThisWeek(item.timestamp)) {
        thisWeek.push(item);
      } else if (isThisMonth(item.timestamp)) {
        thisMonth.push(item);
      } else {
        olderThenMonth.push(item);
      }
    });

    return (
      <View style={styles.container}>
        <FilterBar
          dropdownIconName="arrow-drop-down"
          options={filters.map(item => item.value)}
          defaultText="ALL ACTIVITIES"
          onDropdownSelect={this._handleOnDropdownSelect}
          rightIconName="ios-checkmark"
          onRightIconPress={readAllNotification}
        />
        <ScrollView style={styles.scrollView}>
          {today.length > 0 && (
            <Fragment>
              <ContainerHeader
                hasSeperator
                isBoldTitle
                title={intl.formatMessage({
                  id: 'notification.recent',
                })}
              />
              <FlatList
                data={today}
                renderItem={({ item }) => (
                  <NotificationLine
                    notification={item}
                    handleOnPressNotification={navigateToNotificationRoute}
                  />
                )}
                keyExtractor={item => item.id}
              />
            </Fragment>
          )}
          {yesterday.length > 0 && (
            <Fragment>
              <ContainerHeader
                hasSeperator
                isBoldTitle
                title={intl.formatMessage({
                  id: 'notification.yesterday',
                })}
              />
              <FlatList
                data={yesterday}
                renderItem={({ item }) => (
                  <NotificationLine
                    notification={item}
                    handleOnPressNotification={navigateToNotificationRoute}
                  />
                )}
                keyExtractor={item => item.id}
              />
            </Fragment>
          )}
          {thisWeek.length > 0 && (
            <Fragment>
              <ContainerHeader
                hasSeperator
                isBoldTitle
                title={intl.formatMessage({
                  id: 'notification.this_week',
                })}
              />
              <FlatList
                data={thisWeek}
                renderItem={({ item }) => (
                  <NotificationLine
                    notification={item}
                    handleOnPressNotification={navigateToNotificationRoute}
                  />
                )}
                keyExtractor={item => item.id}
              />
            </Fragment>
          )}
          {thisMonth.length > 0 && (
            <Fragment>
              <ContainerHeader
                hasSeperator
                isBoldTitle
                title={intl.formatMessage({
                  id: 'notification.this_month',
                })}
              />
              <FlatList
                data={thisMonth}
                renderItem={({ item }) => (
                  <NotificationLine
                    notification={item}
                    handleOnPressNotification={navigateToNotificationRoute}
                  />
                )}
                keyExtractor={item => item.id}
              />
            </Fragment>
          )}
          {olderThenMonth.length > 0 && (
            <Fragment>
              <ContainerHeader
                hasSeperator
                isBoldTitle
                title={intl.formatMessage({
                  id: 'notification.older_then',
                })}
              />
              <FlatList
                data={olderThenMonth}
                renderItem={({ item }) => (
                  <NotificationLine
                    notification={item}
                    handleOnPressNotification={navigateToNotificationRoute}
                  />
                )}
                keyExtractor={item => item.id}
              />
            </Fragment>
          )}
        </ScrollView>
      </View>
    );
  }
}

export default injectIntl(NotificationView);
