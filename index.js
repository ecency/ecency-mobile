import { AppRegistry } from 'react-native';
import codePush from 'react-native-code-push';
import { name as appName } from './app.json';
import 'core-js';
import 'intl';

// set check frequency options
const codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_START };
const eSteemApp = codePush(codePushOptions)(require('./App').default);

AppRegistry.registerComponent(appName, () => eSteemApp);
