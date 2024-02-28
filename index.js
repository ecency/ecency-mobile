import { AppRegistry, LogBox } from 'react-native';
import AppCenter from 'appcenter';
import { name as appName } from './app.json';
import 'intl';
import 'intl/locale-data/jsonp/en-US';

// set check frequency options
const EcencyApp = require('./App').default;

AppCenter.setLogLevel(AppCenter.LogLevel.VERBOSE);

// TODO Remove ignoreLogs when referenced issue is fixed properly
// ref: https://github.com/ecency/ecency-mobile/issues/2466
// ignore warnings
LogBox.ignoreLogs(['Require cycle:', 'Remote debugger']);

AppRegistry.registerComponent(appName, () => EcencyApp);
