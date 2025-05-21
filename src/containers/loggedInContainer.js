/* eslint-disable no-unused-vars */
import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import ROUTES from '../constants/routeNames';
import RootNavigation from '../navigation/rootNavigation';

import { NoPost } from '../components';

const LoggedInContainer = ({ isLoggedIn, isLoginDone, children }) => {
  const intl = useIntl();

  if (!isLoggedIn) {
    return (
      <NoPost
        imageStyle={styles.imageStyle}
        isButtonText
        defaultText={intl.formatMessage({
          id: 'profile.login_to_see',
        })}
        handleOnButtonPress={() => RootNavigation.navigate({ name: ROUTES.SCREENS.LOGIN })}
      />
    );
  }

  return (
    children &&
    children({
      isLoggedIn,
      isLoginDone,
    })
  );
};

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,
});

export default connect(mapStateToProps)(LoggedInContainer);
/* eslint-enable */

const styles = EStyleSheet.create({
  imageStyle: {
    width: 193,
    height: 189,
  },
});
