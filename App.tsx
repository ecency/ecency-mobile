// // eslint-disable-next-line
import * as Sentry from '@sentry/react-native';
import App from './src/index';

const enableSessionReplay = __DEV__;
const integrations = [Sentry.feedbackIntegration()];

if (enableSessionReplay) {
  integrations.unshift((Sentry as any).mobileReplayIntegration());
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

// Deep-redact every string inside a value. Sentry stores raw console arguments
// under breadcrumb.data (e.g. data.arguments[1]), so scrubbing the message alone
// is not enough. Mutates objects/arrays in place; depth-guarded.
const redactDeep = (value: any, depth = 0): any => {
  if (value == null || depth > 6) {
    return value;
  }
  if (typeof value === 'string') {
    return redactSecrets(value);
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = redactDeep(value[i], depth + 1);
    }
    return value;
  }
  if (typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      value[key] = redactDeep(value[key], depth + 1);
    });
  }
  return value;
};

const redactBreadcrumb = (breadcrumb: any) => {
  if (!breadcrumb) {
    return breadcrumb;
  }
  if (typeof breadcrumb.message === 'string') {
    breadcrumb.message = redactSecrets(breadcrumb.message);
  }
  breadcrumb.data = redactDeep(breadcrumb.data);
  return breadcrumb;
};

// Benign/expected errors that carry no diagnostic value and should not be reported to
// Sentry: normal user actions (wrong password, wrong PIN, cancelled HiveSigner signing)
// and TanStack Query's internal cancellation signal.
const IGNORED_ERROR_VALUES = ['auth.invalid_credentials', 'auth.invalid_username'];
// CancelledError is covered by ignoreErrors + IGNORED_ERROR_TYPES, so it is not repeated here.
const IGNORED_ERROR_PATTERNS = [/check your PIN/i, /HiveSigner signing cancelled/i];
const IGNORED_ERROR_TYPES = ['CancelledError', 'SigningCancelledError'];

const isIgnoredError = (event: any): boolean =>
  !!event?.exception?.values?.some((v: any) => {
    const value = v?.value || '';
    return (
      IGNORED_ERROR_TYPES.includes(v?.type) ||
      IGNORED_ERROR_VALUES.includes(value) ||
      IGNORED_ERROR_PATTERNS.some((re) => re.test(value))
    );
  });

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
  ignoreErrors: [/CancelledError/],

  beforeBreadcrumb(breadcrumb) {
    return redactBreadcrumb(breadcrumb);
  },

  beforeSend(event) {
    // Drop benign/expected errors (see IGNORED_ERROR_* above) before anything else.
    if (isIgnoredError(event)) {
      return null;
    }
    if (typeof event.message === 'string') {
      event.message = redactSecrets(event.message);
    }
    event.exception?.values?.forEach((value) => {
      if (typeof value.value === 'string') {
        value.value = redactSecrets(value.value);
      }
    });
    // Breadcrumbs already on the event (data included, in case any predate the
    // beforeBreadcrumb scrub). event.breadcrumbs may be an array or {values:[]}.
    const breadcrumbs: any = (event.breadcrumbs as any)?.values ?? event.breadcrumbs;
    if (Array.isArray(breadcrumbs)) {
      breadcrumbs.forEach((breadcrumb) => redactBreadcrumb(breadcrumb));
    }
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
