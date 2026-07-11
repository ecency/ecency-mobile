import postUrlParser, { parseWavesUrl } from './postUrlParser';

describe('parseWavesUrl', () => {
  it('parses waves permalink without @author', () => {
    expect(parseWavesUrl('https://ecency.com/waves/jza/wave-202677t12348900z')).toEqual({
      author: 'jza',
      permlink: 'wave-202677t12348900z',
    });
  });

  it('parses waves permalink with @author', () => {
    expect(parseWavesUrl('https://ecency.com/waves/@jza/wave-202677t12348900z')).toEqual({
      author: 'jza',
      permlink: 'wave-202677t12348900z',
    });
  });

  it('parses www host and ecency:// scheme', () => {
    expect(parseWavesUrl('https://www.ecency.com/waves/alice.bob/wave-1a2b')).toEqual({
      author: 'alice.bob',
      permlink: 'wave-1a2b',
    });
    expect(parseWavesUrl('ecency://waves/jza/wave-1a2b')).toEqual({
      author: 'jza',
      permlink: 'wave-1a2b',
    });
  });

  it('ignores query params and fragments', () => {
    expect(parseWavesUrl('https://ecency.com/waves/jza/wave-1a2b?referral=alice#foo')).toEqual({
      author: 'jza',
      permlink: 'wave-1a2b',
    });
  });

  it('returns null for non-waves and non-ecency urls', () => {
    expect(parseWavesUrl('https://ecency.com/hive/@alice/my-post')).toBeNull();
    expect(parseWavesUrl('https://ecency.com/waves')).toBeNull();
    expect(parseWavesUrl('https://example.com/waves/jza/wave-1a2b')).toBeNull();
    expect(parseWavesUrl('https://ecency.com/@alice')).toBeNull();
    expect(parseWavesUrl('')).toBeNull();
  });
});

describe('postUrlParser', () => {
  it('resolves waves permalink to author/permlink', () => {
    expect(postUrlParser('https://ecency.com/waves/jza/wave-202677t12348900z')).toEqual({
      author: 'jza',
      permlink: 'wave-202677t12348900z',
    });
  });

  it('still resolves regular post urls', () => {
    expect(postUrlParser('https://ecency.com/hive/@alice/my-first-post')).toEqual({
      category: 'hive',
      author: 'alice',
      permlink: 'my-first-post',
    });
  });
});
