import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const navigate = (navigationProps: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(navigationProps);
  }
};

const reset = (navigationProps: any) => {
  if (navigationRef.isReady()) {
    navigationRef.reset(navigationProps);
  }
};

// add other navigation functions that you need and export them

const RootNavigation = {
  navigate,
  reset,
};

export default RootNavigation;
