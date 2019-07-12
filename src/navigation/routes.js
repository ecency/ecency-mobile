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
  Drafts,
  Editor,
  Follows,
  Login,
  PinCode,
  Post,
  Profile,
  Settings,
  SteemConnect,
  Voters,
  SearchResult,
  Transfer,
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

const stackNavigatior = createStackNavigator(
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
  },
  {
    headerMode: 'none',
  },
);

export default createSwitchNavigator({
  stackNavigatior,
  [ROUTES.SCREENS.LOGIN]: { screen: Login },
  [ROUTES.SCREENS.PINCODE]: { screen: PinCode },
  [ROUTES.SCREENS.STEEM_CONNECT]: { screen: SteemConnect },
});
