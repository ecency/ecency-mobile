/* eslint-disable react/jsx-wrap-multilines */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, Text } from 'react-native';
import { injectIntl } from 'react-intl';
// Constants

// Components
import { RefreshControl, FlatList } from 'react-native-gesture-handler';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ContainerHeader } from '../../containerHeader';
import { FilterBar } from '../../filterBar';
import { NotificationLine } from '../..';
import { ListPlaceHolder } from '../../basicUIElements';

// Utils
import { isToday, isYesterday, isThisWeek, isLastWeek, isThisMonth } from '../../../utils/time';

// Styles
import styles from './notificationStyles';
import globalStyles from '../../../globalStyles';

class NotificationView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */
  listRef = null;

  constructor(props) {
    super(props);
    this.state = {
      // TODO: Remove filters from local state.
      filters: [
        { key: 'activities', value: 'ALL' },
        { key: 'replies', value: 'REPLIES' },
        { key: 'mentions', value: 'MENTIONS' },
        // { key: 'reblogs', value: 'REBLOGS' },
      ],
      selectedIndex: 0,
    };
    this.listRef = React.createRef();
  }

  // Component Life Cycles

  // Component Functions

  _handleOnDropdownSelect = async (index) => {
    const { changeSelectedFilter } = this.props;
    const { filters, contentOffset } = this.state;

    const _selectedFilter = filters[index].key;

    this.setState({ selectedIndex: index, contentOffset });
    await changeSelectedFilter(_selectedFilter, index);
    this.listRef.current?.scrollToOffset({ x: 0, y: 0, animated: false });
  };

  _renderList = (data) => {
    const { navigateToNotificationRoute, globalProps } = this.props;

    return (
      <FlatList
        data={data}
        initialNumToRender={data && data.length}
        maxToRenderPerBatch={data && data.length}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationLine
            notification={item}
            handleOnPressNotification={navigateToNotificationRoute}
            globalProps={globalProps}
          />
        )}
      />
    );
  };

  _renderFooterLoading = () => {
    const { isLoading } = this.props;
    if (isLoading) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} animating />
        </View>
      );
    }
    return null;
  };

  _getNotificationsArrays = () => {
    const { notifications, intl } = this.props;

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

    let sectionIndex = -1;
    return notifications.map((item) => {
      const timeIndex = this._getTimeListIndex(item.timestamp);
      if (timeIndex !== sectionIndex && timeIndex > sectionIndex) {
        if (sectionIndex === -1) {
          item.firstSection = true;
        }
        item.sectionTitle = notificationArray[timeIndex].title;
        sectionIndex = timeIndex;
      }
      return item;
    });

    // return notificationArray.filter((item) => item.data.length > 0).map((item, index)=>{item.index = index; return item});
  };

  _getTimeListIndex = (timestamp) => {
    if (isToday(timestamp)) {
      return 0;
    }

    if (isYesterday(timestamp)) {
      return 1;
    }

    if (isThisWeek(timestamp)) {
      return 2;
    }

    if (isLastWeek(timestamp)) {
      return 3;
    }

    if (isThisMonth(timestamp)) {
      return 4;
    }

    return 5;
  };

  _getActivityIndicator = () => (
    <View style={styles.loading}>
      <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} animating size="large" />
    </View>
  );

  _renderSectionHeader = ({ section: { title, index } }) => (
    <ContainerHeader hasSeperator={index !== 0} isBoldTitle title={title} key={title} />
  );

  _renderItem = ({ item }) => (
    <>
      {item.sectionTitle && (
        <ContainerHeader hasSeperator={!item.firstSection} isBoldTitle title={item.sectionTitle} />
      )}
      <NotificationLine
        notification={item}
        handleOnPressNotification={this.props.navigateToNotificationRoute}
        handleOnUserPress={() => {
          this.props.handleOnUserPress(item.source);
        }}
        globalProps={this.props.globalProps}
      />
    </>
  );

  render() {
    const { isDarkTheme } = this.props;

    const { readAllNotification, getActivities, isNotificationRefreshing, intl } = this.props;
    const { filters, selectedIndex } = this.state;
    const _notifications = this._getNotificationsArrays();

    return (
      <View style={styles.container}>
        <FilterBar
          dropdownIconName="arrow-drop-down"
          options={filters.map((item) =>
            intl.formatMessage({ id: `notification.${item.key}` }).toUpperCase(),
          )}
          defaultText="ALL"
          onDropdownSelect={this._handleOnDropdownSelect}
          rightIconName="playlist-add-check"
          rightIconType="MaterialIcons"
          selectedOptionIndex={selectedIndex}
          onRightIconPress={readAllNotification}
        />

        <FlatList
          ref={this.listRef}
          data={_notifications}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={() => getActivities(true)}
          onEndReachedThreshold={0.3}
          ListFooterComponent={this._renderFooterLoading}
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
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}
const mapStateToProps = (state: { application: { isDarkTheme: any } }) => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(injectIntl(NotificationView));
// export default injectIntl(NotificationView);
/* eslint-enable */
