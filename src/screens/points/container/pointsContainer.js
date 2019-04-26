import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Component
import PointsScreen from '../screen/pointsScreen';

// Constants
import ROUTES from '../../../constants/routeNames';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PointsContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions
  _handleOnPressLogin = () => {
    const { navigation } = this.props;

    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  render() {
    const { isLoggedIn } = this.props;

    return <PointsScreen isLoggedIn={isLoggedIn} handleLoginPress={this._handleOnPressLogin} />;
  }
}
const matStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(matStateToProps)(PointsContainer);
