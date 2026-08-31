import { AppRegistry, LogBox, Text, TextInput } from 'react-native';
import { name as appName } from './app.json';

import 'react-native-url-polyfill/auto';
import 'intl';
import 'intl/locale-data/jsonp/en-US';
import 'react-native-get-random-values';
import './src/utils/abortSignalPolyfill';
// Bounds every HTTP(S) fetch. Must run before ./App, which pulls in @ecency/sdk:
// the SDK binds globalThis.fetch on first use and caches the bound reference.
import './src/utils/installFetchDeadline';

import EcencyApp from './App';

// TODO Remove ignoreLogs when referenced issue is fixed properly
// ref: https://github.com/ecency/vision-mobile/issues/2466
// ignore warnings
LogBox.ignoreLogs(['Require cycle:', 'Remote debugger']);

// Cap accessibility font scaling app-wide so a large system "Font size" cannot
// blow up text and overflow layouts. 1.3 keeps a meaningful accessibility boost
// (matches Android's common "Large" step) while preventing the abnormal zoom.
// Android additionally clamps fontScale/density natively (MainActivity/MainApplication);
// this is the cross-platform cap and the primary guard on iOS.
//
// React 19 ignores `defaultProps` on function components, so instead we wrap each
// component's forwardRef render and inject maxFontSizeMultiplier into its props.
// Explicit per-component maxFontSizeMultiplier values still take precedence.
const MAX_FONT_SIZE_MULTIPLIER = 1.3;
const capFontScaling = (Component) => {
  const baseRender = Component && Component.render;
  if (typeof baseRender !== 'function' || baseRender.__fontCapped) {
    return;
  }
  const cappedRender = (props, ref) =>
    baseRender({ maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER, ...props }, ref);
  cappedRender.__fontCapped = true;
  Component.render = cappedRender;
};
capFontScaling(Text);
capFontScaling(TextInput);

AppRegistry.registerComponent(appName, () => EcencyApp);
