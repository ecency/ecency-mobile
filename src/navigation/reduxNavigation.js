import { connect } from 'react-redux';
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';
import AppNavigation from './routes';

const middleware = createReactNavigationReduxMiddleware('root', state => state.nav);

const AppWithNavigationState = reduxifyNavigator(AppNavigation, 'root');

const mapStateToProps = state => ({
  state: state.nav,
});

const ReduxNavigation = connect(mapStateToProps)(AppWithNavigationState);

export { AppNavigation, ReduxNavigation, middleware };
