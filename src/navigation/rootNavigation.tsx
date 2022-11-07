import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const navigate = (navigationProps: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(navigationProps);
  }
};

// add other navigation functions that you need and export them

const RootNavigation = {
  navigate,
};

export default RootNavigation;
