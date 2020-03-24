import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Components
import Icon from '../view/iconView';

class IconContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { badgeType, unreadActivityCount } = this.props;
    const badgeCount = badgeType === 'notification' ? unreadActivityCount : 0;

    return <Icon badgeCount={badgeCount} {...this.props} />;
  }
}

const mapStateToProps = (state) => ({
  unreadActivityCount: state.account.currentAccount.unread_activity_count || 0,
});

export default connect(mapStateToProps)(IconContainer);
