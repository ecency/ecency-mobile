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
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeBottomTab === ROUTES.TABBAR.NOTIFICATION) {
      if (nextProps.username) {
        this._getAvtivities();
      }
    }
  }

  _getAvtivities = (type = null) => {
    const { username } = this.props;

    getActivities({ user: username, type }).then((res) => {
      this.setState({ notifications: res });
    });
  };

  _navigateToNotificationRoute = (data) => {
    const { navigation, username, dispatch } = this.props;

    markActivityAsRead(username, data.id).then((result) => {
      dispatch(updateUnreadActivityCount(result.unread));
    });

    if (data.permlink) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author: data.author,
          permlink: data.permlink,
        },
        key: data.permlink,
      });
    } else {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username: data.follower,
        },
        key: data.follower,
      });
    }
  };

  _readAllNotification = () => {
    const { username, dispatch } = this.props;
    const { notifications } = this.state;
    markActivityAsRead(username).then((result) => {
      dispatch(updateUnreadActivityCount(result.unread));
      const updatedNotifications = notifications.map(item => ({ ...item, read: 1 }));
      this.setState({ notifications: updatedNotifications });
    });
  };

  _handleOnPressLogin = () => {
    const { navigation } = this.props;

    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  render() {
    const { notifications } = this.state;

    return (
      <NotificationScreen
        getActivities={this._getAvtivities}
        notifications={notifications}
        navigateToNotificationRoute={this._navigateToNotificationRoute}
        readAllNotification={this._readAllNotification}
        handleLoginPress={this._handleOnPressLogin}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
  isLoggedIn: state.application.isLoggedIn,
  activeBottomTab: state.ui.activeBottomTab,
});

export default connect(mapStateToProps)(NotificationContainer);
