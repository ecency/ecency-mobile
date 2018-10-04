import React, { Component } from 'react';

// Components
import { SinglePostScreen } from '..';

class SinglePostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <SinglePostScreen {...this.props} />;
  }
}

export default SinglePostContainer;
