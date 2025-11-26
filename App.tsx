// // eslint-disable-next-line
import * as Sentry from '@sentry/react-native';
import App from './src/index';

const enableSessionReplay = __DEV__;
const integrations = [Sentry.feedbackIntegration()];

if (enableSessionReplay) {
  integrations.unshift(Sentry.mobileReplayIntegration());
}

Sentry.init({
  dsn: 'https://a7b0c5a49bdeae965767e2967411b7b0@o4507985141956608.ingest.de.sentry.io/4509786252116048',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Disable in production to avoid unnecessary background
  // processing and battery impact while still sampling replays in development.
  replaysSessionSampleRate: enableSessionReplay ? 0.1 : 0,
  replaysOnErrorSampleRate: enableSessionReplay ? 1 : 0,
  integrations,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

if (__DEV__) {
  import('./reactotron-config').then(() => {
    console.log('Reactotron Configured');
  });
}

export default Sentry.wrap(App);
