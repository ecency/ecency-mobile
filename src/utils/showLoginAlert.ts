import ROUTES from '../constants/routeNames';
import RootNavigation from '../navigation/rootNavigation';

// Previously this popped a "Please login first" confirm dialog with a Login
// button. Per product preference, gated actions (upvote, reblog, write, feed
// tabs, etc.) now take the user straight to the Login screen instead of an
// intermediate alert. The optional intl arg is kept so existing call sites
// — showLoginAlert({ intl }) — keep compiling without changes.
const showLoginAlert = (_props?: { intl?: any }) => {
  RootNavigation.navigate({ name: ROUTES.SCREENS.LOGIN });
};

export default showLoginAlert;
