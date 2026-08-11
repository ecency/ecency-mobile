import { createNavigationContainerRef, NavigationContainerRef } from '@react-navigation/native';
import { AppParamList, ParamsOptional, RouteName } from './types';

export const navigationRef = createNavigationContainerRef<AppParamList>();

/**
 * The object form of navigate, typed against AppParamList so a wrong route name or a params
 * object that does not match the destination is a compile error. This matters most on the paths
 * that reach it: deep-link dispatch, the PIN screen's forwarding, wallet and asset details.
 *
 * `params` is optional only where the destination is navigable without them. React Navigation's
 * own object overload declares `params` as required even when its type includes undefined, which
 * would reject the many `{ name }`-only calls here, so the optionality is derived instead.
 */
export type NavigateOptions = {
  [K in RouteName]: ParamsOptional<K> extends true
    ? { name: K; params?: AppParamList[K]; key?: string; merge?: boolean }
    : { name: K; params: AppParamList[K]; key?: string; merge?: boolean };
}[RouteName];

type ResetState = Parameters<NavigationContainerRef<AppParamList>['reset']>[0];

const navigate = (navigationProps: NavigateOptions) => {
  if (navigationRef.isReady()) {
    // The union has already been checked above; React Navigation's overload cannot narrow it.
    navigationRef.navigate(navigationProps as never);
  }
};

const reset = (navigationProps: ResetState) => {
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
