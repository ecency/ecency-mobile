import { AppRegistry } from 'react-native';
import AppCenter from 'appcenter';
import { name as appName } from './app.json';
import 'core-js';
import 'intl';
import 'intl/locale-data/jsonp/en-US';

// set check frequency options
const eSteemApp = require('./App').default;

AppCenter.setLogLevel(AppCenter.LogLevel.VERBOSE);

AppRegistry.registerComponent(appName, () => eSteemApp);
