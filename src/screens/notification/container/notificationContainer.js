import React, { Component } from 'react';
import { connect } from 'react-redux';

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
    const { username } = this.props;

    getActivities({ user: username, type }).then((res) => {
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

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(NotificationContainer);
