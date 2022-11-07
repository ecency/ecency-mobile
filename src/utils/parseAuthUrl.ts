/**
 * extracts authentication information from deep link url
 */

export enum AUTH_MODES {
  AUTH = 'AUTH',
  SIGNUP = 'SIGNUP',
}

interface ParsedAuthUrl {
  mode: AUTH_MODES;
  username?: string | null;
  code?: string | null;
  referredUser?: string | null;
}

export default (urlString: string): ParsedAuthUrl | null => {
  const url = new URL(urlString);
  console.log(JSON.stringify(url, null, '\t'));
  if (url.pathname === '/signup') {
    const referredUser = url.searchParams.get('referral');
    return {
      mode: AUTH_MODES.SIGNUP,
      referredUser,
    };
  } else if (url.pathname === '/auth') {
    const username = url.searchParams.get('username');
    const code = url.searchParams.get('code'); // TODO: process encryption when in place

    return {
      mode: AUTH_MODES.AUTH,

      username,
      code,
    };
  }

  return null;
};
