import { stripCategoryFromPostPath, getPostUrl } from './post';

describe('stripCategoryFromPostPath', () => {
  it('strips a category segment before /@author/permlink', () => {
    expect(stripCategoryFromPostPath('/hive-125125/@alice/post-1')).toBe('/@alice/post-1');
  });

  it('preserves a comment fragment when stripping the category', () => {
    expect(stripCategoryFromPostPath('/hive-125125/@alice/post-1#@bob/comment-1')).toBe(
      '/@alice/post-1#@bob/comment-1',
    );
  });

  it('handles arbitrary single-segment categories (tags, communities)', () => {
    expect(stripCategoryFromPostPath('/photography/@alice/post-1')).toBe('/@alice/post-1');
    expect(stripCategoryFromPostPath('/hive-100/@alice/post-1')).toBe('/@alice/post-1');
  });

  it('returns canonical paths unchanged', () => {
    expect(stripCategoryFromPostPath('/@alice/post-1')).toBe('/@alice/post-1');
    expect(stripCategoryFromPostPath('/@alice/post-1#@bob/c')).toBe('/@alice/post-1#@bob/c');
  });

  it('returns empty string for null/undefined/empty input', () => {
    expect(stripCategoryFromPostPath('')).toBe('');
    expect(stripCategoryFromPostPath(undefined)).toBe('');
    expect(stripCategoryFromPostPath(null)).toBe('');
  });

  it('does not touch a path that does not match the legacy shape', () => {
    // No @ segment after the first slash — nothing to strip.
    expect(stripCategoryFromPostPath('/discover/communities')).toBe('/discover/communities');
    // Already starts with /@ — guard against double-stripping.
    expect(stripCategoryFromPostPath('/@alice')).toBe('/@alice');
  });
});

describe('getPostUrl', () => {
  it('prefixes the ecency.com base URL', () => {
    expect(getPostUrl('/@alice/post-1')).toBe('https://ecency.com/@alice/post-1');
  });

  it('composes with stripCategoryFromPostPath to emit canonical form', () => {
    expect(getPostUrl(stripCategoryFromPostPath('/hive-125/@alice/post-1'))).toBe(
      'https://ecency.com/@alice/post-1',
    );
  });
});
