import { NavigationActions } from 'react-navigation';

let _navigator;

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
};

const navigate = navigationProps => {
  _navigator.dispatch(
    NavigationActions.navigate({
      ...navigationProps,
    }),
  );
};

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
};
