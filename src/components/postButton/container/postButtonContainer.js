import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';

// Components
import { PostButtonView } from '..';

class PostButtonContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _handleSubButtonPress = (route) => {
    const { navigation } = this.props;

    navigation.navigate(route);
  };

  render() {
    return <PostButtonView handleSubButtonPress={this._handleSubButtonPress} {...this.props} />;
  }
}

export default withNavigation(PostButtonContainer);
