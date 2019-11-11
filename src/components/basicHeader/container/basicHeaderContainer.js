import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Components
import BasicHeaderView from '../view/basicHeaderView';

class BasicHeaderContainer extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { funtion }    handleOnPressPreviewButton                - Preview button active handler....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  _handleOnPressBackButton = () => {
    const { navigation, isNewPost, handleOnBackPress } = this.props;

    if (isNewPost) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.FEED,
      });
    } else {
      navigation.goBack();
    }

    if (handleOnBackPress) {
      handleOnBackPress();
    }
  };

  render() {
    return (
      <BasicHeaderView handleOnPressBackButton={this._handleOnPressBackButton} {...this.props} />
    );
  }
}

export default withNavigation(BasicHeaderContainer);
