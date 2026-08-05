import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import ROUTES from '../constants/routeNames';
import RootNavigation from '../navigation/rootNavigation';
import { selectIsLoggedIn, selectIsLoginDone } from '../redux/selectors';

import { NoPost } from '../components';

const LoggedInContainer = ({ isLoggedIn, isLoginDone, children }: any) => {
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

const mapStateToProps = (state: any) => ({
  isLoggedIn: selectIsLoggedIn(state),
  isLoginDone: selectIsLoginDone(state),
});

export default connect(mapStateToProps)(LoggedInContainer);

const styles = EStyleSheet.create({
  imageStyle: {
    width: 193,
    height: 189,
  },
});
