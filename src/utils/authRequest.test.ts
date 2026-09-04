import { isAuthRequestDeeplink, parseAuthRequestDeeplink } from './authRequest';

describe('auth-request deeplink', () => {
  it('recognises only ecency://auth-request', () => {
    expect(isAuthRequestDeeplink('ecency://auth-request?callback=honeyback%3A%2F%2Fhive')).toBe(
      true,
    );
    expect(isAuthRequestDeeplink('ECENCY://Auth-Request?callback=x')).toBe(true);
    expect(isAuthRequestDeeplink('ecency://login?callback=x')).toBe(false);
    expect(isAuthRequestDeeplink('https://ecency.com/auth-request')).toBe(false);
    expect(isAuthRequestDeeplink('not a url')).toBe(false);
  });

  it('parses the callback, request id, app and optional username', () => {
    const r = parseAuthRequestDeeplink(
      'ecency://auth-request?app=ecency.app&callback=honeyback%3A%2F%2Fhive&request_id=r1&username=%40Good-Karma',
    );
    expect(r).toEqual({
      callback: 'honeyback://hive',
      requestId: 'r1',
      username: 'good-karma',
      app: 'ecency.app',
    });
  });

  it('accepts redirect_uri and return_url for the callback and defaults the rest', () => {
    expect(
      parseAuthRequestDeeplink('ecency://auth-request?redirect_uri=honeyback%3A%2F%2Fhive'),
    ).toEqual({
      callback: 'honeyback://hive',
      requestId: null,
      username: null,
      app: 'another app',
    });
    expect(parseAuthRequestDeeplink('ecency://auth-request?return_url=x%3A%2F%2Fy')?.callback).toBe(
      'x://y',
    );
  });

  it('needs a callback', () => {
    expect(parseAuthRequestDeeplink('ecency://auth-request?request_id=r1')).toBeNull();
    expect(parseAuthRequestDeeplink('garbage')).toBeNull();
  });
});
