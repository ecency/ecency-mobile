import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { isCollapsePostButton } from '../../../redux/actions/uiAction';

// Components
import { PostButtonView } from '..';

class PostButtonContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _handleSubButtonPress = (route, action) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: route,
      params: {
        action,
      },
    });

    // navigation.navigate(route);
  };

  _handleButtonCollapse = (status) => {
    const { dispatch, isCollapsePostButtonOpen } = this.props;
    dispatch(isCollapsePostButton(!isCollapsePostButtonOpen));
  };

  render() {
    return (
      <PostButtonView
        handleButtonCollapse={this._handleButtonCollapse}
        handleSubButtonPress={this._handleSubButtonPress}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  routes: state.nav.routes,
  isCollapsePostButtonOpen: state.ui.isCollapsePostButton,
});

export default connect(mapStateToProps)(withNavigation(PostButtonContainer));
