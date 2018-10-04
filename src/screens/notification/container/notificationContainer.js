import React, { Component } from 'react';

// Components
import { NotificationScreen } from '../index';

class NotificationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <NotificationScreen {...this.props} />;
  }
}

export default NotificationContainer;
