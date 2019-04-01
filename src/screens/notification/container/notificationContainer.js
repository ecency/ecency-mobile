import React, { Component } from 'react';
import { connect } from 'react-redux';

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
      notificationLoading: false,
      readAllNotificationLoading: false,
      selectedFilter: 'activities',
    };
  }

  componentDidMount() {
    const { username } = this.props;

    if (username) {
      this._getAvtivities();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedFilter } = this.state;

    if (nextProps.activeBottomTab === ROUTES.TABBAR.NOTIFICATION && nextProps.username) {
      this._getAvtivities(selectedFilter);
    }
  }

  _getAvtivities = (type = null, loadMore = false) => {
    const { username } = this.props;
    const { lastNotificationId, notifications } = this.state;
    const since = loadMore ? lastNotificationId : null;

    this.setState({ notificationLoading: true });

    getActivities({ user: username, type, since })
      .then((res) => {
        const lastId = [...res].pop().id;

        this.setState({
          notifications: loadMore ? [...notifications, ...res] : res,
          lastNotificationId: lastId,
          notificationLoading: false,
        });
      })
      .catch(() => this.setState({ notificationLoading: false }));
  };

  _navigateToNotificationRoute = (data) => {
    const { navigation, username, dispatch } = this.props;
    let routeName;
    let params;
    let key;
    markActivityAsRead(username, data.id).then((result) => {
      dispatch(updateUnreadActivityCount(result.unread));
    });

    if (data.permlink) {
      routeName = ROUTES.SCREENS.POST;
      key = data.permlink;
      params = {
        author: data.author,
        permlink: data.permlink,
        isHasParentPost: data.parent_author && data.parent_permlink,
      };
    } else if (data.type === 'follow') {
      routeName = ROUTES.SCREENS.PROFILE;
      key = data.follower;
      params = {
        username: data.follower,
      };
    } else if (data.type === 'transfer') {
      routeName = ROUTES.TABBAR.PROFILE;
      params = { activePage: 2 };
    }

    navigation.navigate({
      routeName,
      params,
      key,
    });
  };

  _readAllNotification = () => {
    const { username, dispatch } = this.props;
    const { notifications } = this.state;

    this.setState({ readAllNotificationLoading: true });

    markActivityAsRead(username).then((result) => {
      dispatch(updateUnreadActivityCount(result.unread));
      const updatedNotifications = notifications.map(item => ({ ...item, read: 1 }));
      this.setState({ notifications: updatedNotifications, readAllNotificationLoading: false });
    });
  };

  _handleOnPressLogin = () => {
    const { navigation } = this.props;

    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  _changeSelectedFilter = (value) => {
    this.setState({ selectedFilter: value });
  };

  render() {
    const { isLoggedIn } = this.props;
    const {
      notifications,
      notificationLoading,
      readAllNotificationLoading,
      isDarkTheme,
    } = this.state;

    return (
      <NotificationScreen
        getActivities={this._getAvtivities}
        notifications={notifications}
        isDarkTheme={isDarkTheme}
        navigateToNotificationRoute={this._navigateToNotificationRoute}
        readAllNotification={this._readAllNotification}
        handleLoginPress={this._handleOnPressLogin}
        notificationLoading={notificationLoading}
        readAllNotificationLoading={readAllNotificationLoading}
        isLoggedIn={isLoggedIn}
        changeSelectedFilter={this._changeSelectedFilter}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  isDarkTheme: state.application.isDarkTheme,

  username: state.account.currentAccount.name,
  activeBottomTab: state.ui.activeBottomTab,
});

export default connect(mapStateToProps)(NotificationContainer);
