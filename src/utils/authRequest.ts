// ecency://auth-request: another app asks Ecency to sign the user in and
// come back on its callback with the username and a sign-in proof, never a key.
//
//   ecency://auth-request?callback=<url>&request_id=<id>[&username=<u>]
//
// Success:  <callback>?status=success&username=<u>&code=<proof>&request_id=<id>
// Refusal:  <callback>?status=error&error=<code>&request_id=<id>
//
// The proof is what makeHsLoginProof builds: a HiveSigner-style message signed
// with the account's key, typed login for the app ecency.app, naming the
// callback's origin as its audience. HiveSigner's /api/me answers it with the
// account; its token route, its broadcast route and Ecency's code exchange
// all refuse it, so unlike a HiveSigner code it cannot become a token or an
// operation. Receivers verify the signature against the account's keys on
// chain or through /api/me, and check the timestamp themselves, since
// HiveSigner does not.
//
// Accounts that hold no key here (signed in through HiveSigner or HiveAuth)
// are answered with use_hivesigner: their stored token is a reusable signing
// credential and is never shared. The user confirms before any answer, and
// refusals name no account, so a caller cannot learn which accounts live on
// the device. The requester shown to the user is the callback itself: nothing
// the caller says about itself is displayed, and a username that is not a
// Hive account name makes the whole request invalid, so nothing a caller
// writes reaches the confirmation either.

export interface AuthRequest {
  callback: string;
  requestId: string | null;
  username: string | null; // a specific account, or the current one when absent
}

// A Hive account name as the chain accepts it: lowercase, 3 to 16 characters.
// The same test games-api and the Honeyback client apply.
const HIVE_ACCOUNT_NAME = /^[a-z][a-z0-9.-]{2,15}$/;

export const isHiveAccountName = (name: string): boolean => HIVE_ACCOUNT_NAME.test(name);

export const isAuthRequestDeeplink = (deeplink: string): boolean => {
  try {
    const url = new URL(deeplink);
    return (
      url.protocol.toLowerCase() === 'ecency:' && url.hostname.toLowerCase() === 'auth-request'
    );
  } catch (err) {
    return false;
  }
};

// Schemes the answer must never be sent to: plain-text transports, things
// that run in a page, messaging handlers, Android intent URIs, and our own
// schemes, where the answer would only loop back into this app. Any other
// app scheme or https is fine; the user sees the raw callback as the
// requester and must approve it.
const REJECTED_CALLBACK_SCHEMES = [
  'http:',
  'ftp:',
  'ftps:',
  'sftp:',
  'ws:',
  'wss:',
  'intent:',
  'mailto:',
  'tel:',
  'sms:',
  'smsto:',
  'javascript:',
  'data:',
  'file:',
  'blob:',
  'about:',
  'content:',
  'ecency:',
  'hive:',
];

// A callback the answer may be sent to: an app's own scheme or https.
export const isAcceptableCallback = (callback: string): boolean => {
  try {
    const url = new URL(callback);
    return !REJECTED_CALLBACK_SCHEMES.includes(url.protocol.toLowerCase());
  } catch (err) {
    return false;
  }
};

// Who a proof is for: the callback's scheme and host, lowercased, such as
// honeyback://hive or https://games-api.ecency.com.
export const callbackAudience = (callback: string): string => {
  try {
    const url = new URL(callback);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch (err) {
    return callback;
  }
};

export const parseAuthRequestDeeplink = (deeplink: string): AuthRequest | null => {
  try {
    const url = new URL(deeplink);
    const callback =
      url.searchParams.get('callback') ||
      url.searchParams.get('redirect_uri') ||
      url.searchParams.get('return_url');
    if (!callback || !isAcceptableCallback(callback)) {
      return null;
    }
    const username = (url.searchParams.get('username') || '')
      .replace(/^@/, '')
      .trim()
      .toLowerCase();
    if (username && !isHiveAccountName(username)) {
      return null;
    }
    return {
      callback,
      requestId: url.searchParams.get('request_id'),
      username: username || null,
    };
  } catch (err) {
    return null;
  }
};
