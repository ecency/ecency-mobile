// // eslint-disable-next-line
import * as Sentry from '@sentry/react-native';
import App from './src/index';

const enableSessionReplay = __DEV__;
const integrations = [Sentry.feedbackIntegration()];

if (enableSessionReplay) {
  integrations.unshift(Sentry.mobileReplayIntegration());
}

// Defense-in-depth: redact Hive private keys (WIF) and obvious bearer/access
// tokens from anything that reaches Sentry, so an accidental log of a secret can
// never leave the device in a breadcrumb or event payload.
const HIVE_WIF_KEY = /\b5[HJK][1-9A-HJ-NP-Za-km-z]{48,51}\b/g;
const BEARER_TOKEN = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{12,}/gi;
const redactSecrets = (value: unknown): any => {
  if (typeof value !== 'string') {
    return value;
  }
  return value.replace(HIVE_WIF_KEY, '<redacted-key>').replace(BEARER_TOKEN, '$1 <redacted>');
};

Sentry.init({
  dsn: 'https://a7b0c5a49bdeae965767e2967411b7b0@o4507985141956608.ingest.de.sentry.io/4509786252116048',

  // Do not attach default PII (IP address, cookies, user, etc.) to events.
  // https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: false,

  // Disable in production to avoid unnecessary background
  // processing and battery impact while still sampling replays in development.
  replaysSessionSampleRate: enableSessionReplay ? 0.1 : 0,
  replaysOnErrorSampleRate: enableSessionReplay ? 1 : 0,
  integrations,

  beforeBreadcrumb(breadcrumb) {
    if (typeof breadcrumb.message === 'string') {
      breadcrumb.message = redactSecrets(breadcrumb.message);
    }
    return breadcrumb;
  },

  beforeSend(event) {
    if (typeof event.message === 'string') {
      event.message = redactSecrets(event.message);
    }
    event.exception?.values?.forEach((value) => {
      if (typeof value.value === 'string') {
        value.value = redactSecrets(value.value);
      }
    });
    return event;
  },

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

if (__DEV__) {
  import('./reactotron-config').then(() => {
    console.log('Reactotron Configured');
  });
}

export default Sentry.wrap(App);
