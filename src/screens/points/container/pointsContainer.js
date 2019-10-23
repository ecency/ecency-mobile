import React from 'react';
import { connect } from 'react-redux';

// Component
import PointsScreen from '../screen/pointsScreen';

// Constants
import ROUTES from '../../../constants/routeNames';

const PointsContainer = ({ isLoggedIn, navigation }) => {
  const _handleOnPressLogin = () => {
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  return <PointsScreen isLoggedIn={isLoggedIn} handleLoginPress={_handleOnPressLogin} />;
};

const matStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(matStateToProps)(PointsContainer);
