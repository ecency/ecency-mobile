import { AppRegistry, LogBox, Text, TextInput } from 'react-native';
import { name as appName } from './app.json';

import 'react-native-url-polyfill/auto';
import 'intl';
import 'intl/locale-data/jsonp/en-US';
import 'react-native-get-random-values';
import './src/utils/abortSignalPolyfill';

import EcencyApp from './App';

// TODO Remove ignoreLogs when referenced issue is fixed properly
// ref: https://github.com/ecency/ecency-mobile/issues/2466
// ignore warnings
LogBox.ignoreLogs(['Require cycle:', 'Remote debugger']);

// Cap accessibility font scaling app-wide so a large system "Font size" cannot
// blow up text and overflow layouts. 1.3 keeps a meaningful accessibility boost
// (matches Android's common "Large" step) while preventing the abnormal zoom.
// Native density/fontScale are additionally clamped on Android in MainActivity.
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1.3;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.3;

AppRegistry.registerComponent(appName, () => EcencyApp);
