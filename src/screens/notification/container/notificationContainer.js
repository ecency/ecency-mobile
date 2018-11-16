import React, { Component } from 'react';

// Actions and Services
import { getActivities } from '../../../providers/esteem/esteem';

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
    getActivities({ user: 'mistikk', type }).then((res) => {
      console.log('res :', res);
      this.setState({ notifications: res });
    });
  };

  render() {
    const { notifications } = this.state;

    return (
      <NotificationScreen
        getActivities={this._getAvtivities}
        notifications={notifications}
        {...this.props}
      />
    );
  }
}

export default NotificationContainer;
