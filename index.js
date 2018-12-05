import 'core-js';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

global.Intl = require('intl');

AppRegistry.registerComponent(appName, () => require('./App').default);
