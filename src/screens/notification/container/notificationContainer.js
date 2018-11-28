import React, { Component } from 'react';
import { connect } from 'react-redux';

// Actions and Services
import { getActivities } from '../../../providers/esteem/esteem';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import { NotificationScreen } from '../index';

class NotificationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
    };
  }

  componentWillMount() {
    this._getAvtivities();
  }

  _getAvtivities = (type = null) => {
    const { username } = this.props;

    getActivities({ user: username, type }).then((res) => {
      this.setState({ notifications: res });
    });
  };

  _navigateToNotificationRoute = (data) => {
    const { navigation } = this.props;

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


  render() {
    const { notifications } = this.state;

    return (
      <NotificationScreen
        getActivities={this._getAvtivities}
        notifications={notifications}
        navigateToNotificationRoute={this._navigateToNotificationRoute}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(NotificationContainer);
