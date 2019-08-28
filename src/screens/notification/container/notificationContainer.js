import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

// Actions and Services
import { getActivities, markActivityAsRead } from '../../../providers/esteem/esteem';
import { updateUnreadActivityCount } from '../../../redux/actions/accountAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import NotificationScreen from '../screen/notificationScreen';

class NotificationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      lastNotificationId: null,
      isNotificationRefreshing: false,
      selectedFilter: 'activities',
      endOfNotification: false,
    };
  }

  componentDidMount() {
    const { username, isConnected } = this.props;

    if (username && isConnected) {
      this._getAvtivities(username);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedFilter } = this.state;
    const { username } = this.props;

    if (
      (nextProps.activeBottomTab === ROUTES.TABBAR.NOTIFICATION && nextProps.username) ||
      (nextProps.username !== username && nextProps.username)
    ) {
      this.setState({ endOfNotification: false }, () =>
        this._getAvtivities(nextProps.username, selectedFilter),
      );
    }
  }

  _getAvtivities = (user, type = null, loadMore = false) => {
    const { lastNotificationId, notifications, endOfNotification } = this.state;
    const since = loadMore ? lastNotificationId : null;
    const { username } = this.props;

    if (!endOfNotification) {
      this.setState({ isNotificationRefreshing: true });
      getActivities({ user: user || username, type, since })
        .then(res => {
          const lastId = res.length > 0 ? [...res].pop().id : null;
          if (lastId === lastNotificationId || res.length === 0) {
            this.setState({
              endOfNotification: true,
              isNotificationRefreshing: false,
            });
          } else {
            this.setState({
              notifications: loadMore ? [...notifications, ...res] : res,
              lastNotificationId: lastId,
              isNotificationRefreshing: false,
            });
          }
        })
        .catch(() => this.setState({ isNotificationRefreshing: false }));
    }
  };

  _navigateToNotificationRoute = data => {
    const { navigation, username, dispatch } = this.props;
    const type = get(data, 'type');
    const permlink = get(data, 'permlink');
    const author = get(data, 'author');
    let routeName;
    let params;
    let key;
    markActivityAsRead(username, data.id).then(result => {
      dispatch(updateUnreadActivityCount(result.unread));
    });

    if (permlink) {
      routeName = ROUTES.SCREENS.POST;
      key = permlink;
      params = {
        author,
        permlink,
        isHasParentPost: get(data, 'parent_permlink'),
      };
    } else if (type === 'follow') {
      routeName = ROUTES.SCREENS.PROFILE;
      key = get(data, 'follower');
      params = {
        username: get(data, 'follower'),
      };
    } else if (type === 'transfer') {
      routeName = ROUTES.TABBAR.PROFILE;
      params = { activePage: 2 };
    }

    if (routeName) {
      navigation.navigate({
        routeName,
        params,
        key,
      });
    }
  };

  _readAllNotification = () => {
    const { username, dispatch, intl, isConnected } = this.props;
    const { notifications } = this.state;

    if (!isConnected) return;

    this.setState({ isNotificationRefreshing: true });

    markActivityAsRead(username)
      .then(() => {
        const updatedNotifications = notifications.map(item => ({ ...item, read: 1 }));
        dispatch(updateUnreadActivityCount(0));
        this.setState({ notifications: updatedNotifications, isNotificationRefreshing: false });
      })
      .catch(() => {
        Alert.alert(
          intl.formatMessage({ id: 'alert.error' }),
          intl.formatMessage({ d: 'alert.unknow_error' }),
        );
        this.setState({ isNotificationRefreshing: false });
      });
  };

  _handleOnPressLogin = () => {
    const { navigation } = this.props;

    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  _changeSelectedFilter = async value => {
    await this.setState({ selectedFilter: value, endOfNotification: false });
  };

  render() {
    const { isLoggedIn } = this.props;
    const { notifications, isNotificationRefreshing, isDarkTheme } = this.state;

    return (
      <NotificationScreen
        getActivities={this._getAvtivities}
        notifications={notifications}
        isDarkTheme={isDarkTheme}
        navigateToNotificationRoute={this._navigateToNotificationRoute}
        readAllNotification={this._readAllNotification}
        handleLoginPress={this._handleOnPressLogin}
        isNotificationRefreshing={isNotificationRefreshing}
        isLoggedIn={isLoggedIn}
        changeSelectedFilter={this._changeSelectedFilter}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  isDarkTheme: state.application.isDarkTheme,
  isConnected: state.application.isConnected,

  username: state.account.currentAccount.name,
  activeBottomTab: state.ui.activeBottomTab,
});

export default injectIntl(connect(mapStateToProps)(NotificationContainer));
