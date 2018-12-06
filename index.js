import 'core-js';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import 'intl';

AppRegistry.registerComponent(appName, () => require('./App').default);
