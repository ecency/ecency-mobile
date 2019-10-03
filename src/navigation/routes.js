import {
  createDrawerNavigator,
  createSwitchNavigator,
  createStackNavigator,
} from 'react-navigation';
import { BaseNavigator } from './baseNavigator';
import { default as ROUTES } from '../constants/routeNames';

// Screens
import {
  Bookmarks,
  Boost,
  Drafts,
  Editor,
  Follows,
  SpinGame,
  Login,
  PinCode,
  Post,
  Profile,
  ProfileEdit,
  Reblogs,
  Redeem,
  SearchResult,
  Settings,
  SteemConnect,
  Transfer,
  Voters,
} from '../screens';

// Components
import { SideMenu } from '../components';

const mainNavigation = createDrawerNavigator(
  {
    [ROUTES.SCREENS.HOME]: {
      screen: BaseNavigator,
    },
  },
  {
    contentComponent: SideMenu,
  },
);

const stackNavigator = createStackNavigator(
  {
    [ROUTES.DRAWER.MAIN]: {
      screen: mainNavigation,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.PROFILE]: {
      screen: Profile,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.PROFILE_EDIT]: {
      screen: ProfileEdit,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.POST]: {
      screen: Post,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.EDITOR]: {
      screen: Editor,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.VOTERS]: {
      screen: Voters,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.FOLLOWS]: {
      screen: Follows,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.SETTINGS]: {
      screen: Settings,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.DRAFTS]: {
      screen: Drafts,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.BOOKMARKS]: {
      screen: Bookmarks,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.SEARCH_RESULT]: {
      screen: SearchResult,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.TRANSFER]: {
      screen: Transfer,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.BOOST]: {
      screen: Boost,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.REDEEM]: {
      screen: Redeem,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.REBLOGS]: {
      screen: Reblogs,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.SPIN_GAME]: {
      screen: SpinGame,
      navigationOptions: {
        header: () => null,
      },
    },
  },
  {
    headerMode: 'none',
  },
);

export default createSwitchNavigator({
  stackNavigator,
  [ROUTES.SCREENS.LOGIN]: { screen: Login },
  [ROUTES.SCREENS.PINCODE]: { screen: PinCode },
  [ROUTES.SCREENS.STEEM_CONNECT]: { screen: SteemConnect },
});
