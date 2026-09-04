import {
  isAcceptableCallback,
  isAuthRequestDeeplink,
  parseAuthRequestDeeplink,
} from './authRequest';

describe('auth-request deeplink', () => {
  it('recognises only ecency://auth-request', () => {
    expect(isAuthRequestDeeplink('ecency://auth-request?callback=honeyback%3A%2F%2Fhive')).toBe(
      true,
    );
    expect(isAuthRequestDeeplink('ECENCY://Auth-Request?callback=x%3A%2F%2Fy')).toBe(true);
    expect(isAuthRequestDeeplink('ecency://login?callback=x')).toBe(false);
    expect(isAuthRequestDeeplink('https://ecency.com/auth-request')).toBe(false);
    expect(isAuthRequestDeeplink('not a url')).toBe(false);
  });

  it('parses the callback, request id and optional username', () => {
    const r = parseAuthRequestDeeplink(
      'ecency://auth-request?app=Trusted&callback=honeyback%3A%2F%2Fhive&request_id=r1&username=%40Good-Karma',
    );
    expect(r).toEqual({ callback: 'honeyback://hive', requestId: 'r1', username: 'good-karma' });
  });

  it('accepts redirect_uri and return_url for the callback', () => {
    expect(
      parseAuthRequestDeeplink('ecency://auth-request?redirect_uri=honeyback%3A%2F%2Fhive'),
    ).toEqual({
      callback: 'honeyback://hive',
      requestId: null,
      username: null,
    });
    expect(parseAuthRequestDeeplink('ecency://auth-request?return_url=x%3A%2F%2Fy')?.callback).toBe(
      'x://y',
    );
  });

  it('needs a callback the answer may go to', () => {
    expect(parseAuthRequestDeeplink('ecency://auth-request?request_id=r1')).toBeNull();
    expect(
      parseAuthRequestDeeplink('ecency://auth-request?callback=http%3A%2F%2Fevil.example%2Fc'),
    ).toBeNull();
    expect(
      parseAuthRequestDeeplink('ecency://auth-request?callback=javascript%3Aalert(1)'),
    ).toBeNull();
    expect(
      parseAuthRequestDeeplink(
        'ecency://auth-request?callback=https%3A%2F%2Fgames-api.ecency.com%2Fv1%2Fhive%2Fcallback',
      )?.callback,
    ).toBe('https://games-api.ecency.com/v1/hive/callback');
    expect(parseAuthRequestDeeplink('garbage')).toBeNull();
  });

  it('rejects transports, page schemes, messaging handlers and intents', () => {
    expect(isAcceptableCallback('honeyback://hive')).toBe(true);
    expect(isAcceptableCallback('anyapp://callback')).toBe(true);
    expect(isAcceptableCallback('https://example.com/cb')).toBe(true);
    [
      'http://example.com/cb',
      'ftp://example.com/cb',
      'ws://example.com/cb',
      'wss://example.com/cb',
      'intent://collect#Intent;scheme=evil;end',
      'mailto:someone@example.com',
      'tel:+123',
      'data:text/html,x',
      'javascript:alert(1)',
      'nope',
    ].forEach((rejected) => {
      expect(isAcceptableCallback(rejected)).toBe(false);
    });
  });
});
