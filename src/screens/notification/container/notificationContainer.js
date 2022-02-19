/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

// Actions and Services
import { unionBy } from 'lodash';
import { getNotifications, markNotifications } from '../../../providers/ecency/ecency';
import { updateUnreadActivityCount } from '../../../redux/actions/accountAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import NotificationScreen from '../screen/notificationScreen';
import { showProfileModal } from '../../../redux/actions/uiAction';
import { markHiveNotifications } from '../../../providers/hive/dhive';
import bugsnapInstance from '../../../config/bugsnag';

class NotificationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      lastNotificationId: null,
      isRefreshing: false,
      isLoading: false,
      selectedFilter: 'activities',
      endOfNotification: false,
      selectedIndex: 0,
    };
  }

  componentDidMount() {
    const { isConnected } = this.props;

    if (isConnected) {
      this._getActivities();
    }
  }

  _getActivities = (type = 'activities', loadMore = false) => {
    const { lastNotificationId, notifications, endOfNotification, isLoading } = this.state;
    const since = loadMore ? lastNotificationId : null;

    if (isLoading) {
      return;
    }

    if (!endOfNotification || !loadMore) {
      this.setState({
        isRefreshing: !loadMore,
        isLoading: true,
      });
      getNotifications({ filter: type, since: since, limit: 20 })
        .then((res) => {
          console.log(res);
          const lastId = res.length > 0 ? [...res].pop().id : null;

          if (loadMore && (lastId === lastNotificationId || res.length === 0)) {
            this.setState({
              endOfNotification: true,
              isRefreshing: false,
              isLoading: false,
            });
          } else {
            this.setState({
              notifications: loadMore ? unionBy(notifications, res, 'id') : res,
              lastNotificationId: lastId,
              isRefreshing: false,
              isLoading: false,
            });
          }
        })
        .catch(() => this.setState({ isRefreshing: false, isLoading: false }));
    }
  };

  _navigateToNotificationRoute = (data) => {
    const { navigation, dispatch } = this.props;
    const type = get(data, 'type');
    const permlink = get(data, 'permlink');
    const author = get(data, 'author');
    let routeName;
    let params;
    let key;
    markNotifications(data.id).then((result) => {
      const { unread } = result;
      dispatch(updateUnreadActivityCount(unread));
    });

    if (permlink && author) {
      routeName = ROUTES.SCREENS.POST;
      key = permlink;
      params = {
        author,
        permlink,
      };
    } else if (type === 'follow') {
      routeName = ROUTES.SCREENS.PROFILE;
      key = get(data, 'follower');
      params = {
        username: get(data, 'follower'),
      };
    } else if (type === 'transfer') {
      routeName = ROUTES.TABBAR.WALLET;
    } else if (type === 'spin') {
      routeName = ROUTES.SCREENS.BOOST;
    } else if (type === 'inactive') {
      routeName = ROUTES.SCREENS.EDITOR;
    }

    if (routeName) {
      navigation.navigate({
        routeName,
        params,
        key,
      });
    }
  };

  _handleOnUserPress = (username) => {
    const { dispatch } = this.props;
    dispatch(showProfileModal(username));
  };

  _readAllNotification = () => {
    const { dispatch, intl, isConnected, currentAccount, pinCode } = this.props;
    const { notifications } = this.state;

    if (!isConnected) {
      return;
    }

    this.setState({ isRefreshing: true });

    markNotifications()
      .then(() => {
        const updatedNotifications = notifications.map((item) => ({ ...item, read: 1 }));
        dispatch(updateUnreadActivityCount(0));
        markHiveNotifications(currentAccount, pinCode)
          .then(() => {
            console.log('Hive notifications marked as Read');
          })
          .catch((err) => {
            bugsnapInstance.notify(err);
          });
        this.setState({ notifications: updatedNotifications, isRefreshing: false });
      })
      .catch(() => {
        Alert.alert(
          intl.formatMessage({ id: 'alert.error' }),
          intl.formatMessage({ d: 'alert.unknow_error' }),
        );
        this.setState({ isRefreshing: false });
      });
  };

  _handleOnPressLogin = () => {
    const { navigation } = this.props;

    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  _changeSelectedFilter = async (value, ind) => {
    await this.setState({ selectedFilter: value, endOfNotification: false, selectedIndex: ind });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { selectedFilter } = this.state;
    const { username } = this.props;

    if (
      (nextProps.activeBottomTab === ROUTES.TABBAR.NOTIFICATION && nextProps.username) ||
      (nextProps.username !== username && nextProps.username)
    ) {
      this.setState({ endOfNotification: false }, () => this._getActivities(selectedFilter));
    }
  }

  render() {
    const { isLoggedIn } = this.props;
    const { notifications, isRefreshing } = this.state;

    return (
      <NotificationScreen
        getActivities={this._getActivities}
        notifications={notifications}
        navigateToNotificationRoute={this._navigateToNotificationRoute}
        handleOnUserPress={this._handleOnUserPress}
        readAllNotification={this._readAllNotification}
        handleLoginPress={this._handleOnPressLogin}
        isNotificationRefreshing={isRefreshing}
        isLoggedIn={isLoggedIn}
        changeSelectedFilter={this._changeSelectedFilter}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  isConnected: state.application.isConnected,

  username: state.account.currentAccount.name,
  activeBottomTab: state.ui.activeBottomTab,
});

export default injectIntl(connect(mapStateToProps)(NotificationContainer));
/* eslint-enable */
