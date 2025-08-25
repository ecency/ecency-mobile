import { AppRegistry, LogBox } from 'react-native';
import { name as appName } from './app.json';

import 'react-native-url-polyfill/auto';
import 'intl';
import 'intl/locale-data/jsonp/en-US';
import 'react-native-get-random-values';

import EcencyApp from './App';

// TODO Remove ignoreLogs when referenced issue is fixed properly
// ref: https://github.com/ecency/ecency-mobile/issues/2466
// ignore warnings
LogBox.ignoreLogs(['Require cycle:', 'Remote debugger']);

AppRegistry.registerComponent(appName, () => EcencyApp);
