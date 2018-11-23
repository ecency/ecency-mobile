import React, { Component } from 'react';
import { connect } from 'react-redux';

// Components
import { Icon } from '../..';

class NotificationButtonContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { color, unreadActivityCount, size } = this.props;
    return (
      <Icon
        iconType="FontAwesome"
        badgeCount={unreadActivityCount}
        name="bell-o"
        color={color}
        size={size}
        style={{ padding: 20 }}
      />
    );
  }
}

const mapStateToProps = state => ({
  unreadActivityCount: state.account.currentAccount.unread_activity_count || 0,
});

export default connect(mapStateToProps)(NotificationButtonContainer);
