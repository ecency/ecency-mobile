// ecency://auth-request: another app asks Ecency to sign the user in and
// come back on its callback with the username and a login proof, never a key.
//
//   ecency://auth-request?callback=<url>&request_id=<id>[&username=<u>]
//
// Success:  <callback>?status=success&username=<u>&code=<login code>&request_id=<id>
// Refusal:  <callback>?status=error&error=<code>&request_id=<id>
//
// The code is what makeHsCode builds: a fresh message signed with the posting
// key for ecency.app, verifiable the HiveSigner way and good for nothing else.
// Accounts that hold no posting key here (signed in through HiveSigner or
// HiveAuth) are answered with use_hivesigner: their stored token is a
// reusable signing credential and is never shared. The user confirms before
// any answer, and refusals name no account, so a caller cannot learn which
// accounts live on the device. The requester shown to the user is the
// callback itself; nothing the caller says about itself is displayed.

export interface AuthRequest {
  callback: string;
  requestId: string | null;
  username: string | null; // a specific account, or the current one when absent
}

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

// / A callback the answer may be sent to: an app's own scheme or https, never
// / plain http or anything that runs in a page.
export const isAcceptableCallback = (callback: string): boolean => {
  try {
    const url = new URL(callback);
    const protocol = url.protocol.toLowerCase();
    return !['http:', 'javascript:', 'data:', 'file:', 'blob:', 'about:'].includes(protocol);
  } catch (err) {
    return false;
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
    return {
      callback,
      requestId: url.searchParams.get('request_id'),
      username: username || null,
    };
  } catch (err) {
    return null;
  }
};
