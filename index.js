import 'core-js';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import 'intl';
import codePush from "react-native-code-push";

//set check frequency options
const codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_START };
const eSteemApp = codePush(codePushOptions)(require('./App').default);

AppRegistry.registerComponent(appName, () => eSteemApp);
