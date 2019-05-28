import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { isCollapsePostButton } from '../../../redux/actions/uiAction';

// Components
import PostButtonView from '../view/postButtonView';

class PostButtonContainer extends PureComponent {
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
  };

  _handleButtonCollapse = (status, platformIsAndroid) => {
    const { dispatch, isCollapsePostButtonOpen } = this.props;
    if (isCollapsePostButtonOpen !== status || platformIsAndroid) {
      dispatch(isCollapsePostButton(!isCollapsePostButtonOpen));
    }
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
