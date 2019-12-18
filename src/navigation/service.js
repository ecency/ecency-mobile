import { NavigationActions } from 'react-navigation';

let _navigator;

let navigationStack = [];

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
  if (navigationStack.length > 0) {
    navigationStack.forEach(item => navigate(item));
    navigationStack = [];
  }
};

const navigate = navigationProps => {
  if (!_navigator) {
    navigationStack.push(navigationProps);
  } else {
    _navigator.dispatch(
      NavigationActions.navigate({
        ...navigationProps,
      }),
    );
  }
};

// add other navigation functions that you need and export them

export { navigate, setTopLevelNavigator };
