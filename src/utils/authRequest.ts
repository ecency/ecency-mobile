// ecency://auth-request: another app asks Ecency to sign the user in and
// come back on its callback with the username and a login proof, never a key.
//
//   ecency://auth-request?callback=<url>&request_id=<id>[&username=<u>][&app=<name>]
//
// Success:  <callback>?status=success&username=<u>&code=<login code>&request_id=<id>
//       or  <callback>?status=success&username=<u>&access_token=<HiveSigner token>&request_id=<id>
// Refusal:  <callback>?status=error&error=<code>&message=<text>&request_id=<id>
//
// The code is what makeHsCode builds (signed for ecency.app with the posting
// key); accounts signed in through HiveSigner or HiveAuth hand over their
// HiveSigner access token instead. Both verify the HiveSigner way.

export interface AuthRequest {
  callback: string;
  requestId: string | null;
  username: string | null; // a specific account, or the current one when absent
  app: string; // who is asking, for the confirmation only
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

export const parseAuthRequestDeeplink = (deeplink: string): AuthRequest | null => {
  try {
    const url = new URL(deeplink);
    const callback =
      url.searchParams.get('callback') ||
      url.searchParams.get('redirect_uri') ||
      url.searchParams.get('return_url');
    if (!callback) {
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
      app: (url.searchParams.get('app') || '').trim() || 'another app',
    };
  } catch (err) {
    return null;
  }
};
