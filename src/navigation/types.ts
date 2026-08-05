import ROUTES from '../constants/routeNames';

type ValueOf<T> = T[keyof T];

/** Every navigable route name in the app, derived from the ROUTES constants. */
export type RouteName =
  | ValueOf<typeof ROUTES.SCREENS>
  | ValueOf<typeof ROUTES.MODALS>
  | ValueOf<typeof ROUTES.DRAWER>
  | ValueOf<typeof ROUTES.TABBAR>
  | ValueOf<typeof ROUTES.STACK>;

/**
 * Route names are checked; params stay any until each screen's contract is
 * typed (#3445). Registered globally so every useNavigation() call is typed
 * without generics at the call sites.
 */
export type AppParamList = Record<RouteName, any>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends AppParamList {}
  }
}
