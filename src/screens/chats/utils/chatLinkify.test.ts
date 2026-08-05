import LinkifyIt from 'linkify-it';
import { addHiveScheme } from './chatLinkify';

const makeLinkify = () => {
  const linkify = new LinkifyIt();
  linkify.set({ fuzzyLink: false });
  return addHiveScheme(linkify);
};

// A real hive-uri payload ends in `..` (the `=` padding under hive-uri's
// custom base64), so verify those trailing dots are kept in the match.
const HIVE_URI = 'hive://sign/op/WyJhY2NvdW50X3VwZGF0ZTIiLHt9XQ..';

describe('addHiveScheme (chat linkify)', () => {
  it('detects a hive:// signing link', () => {
    const matches = makeLinkify().match(`please open ${HIVE_URI} to restore`);
    expect(matches).toBeTruthy();
    const hit = matches?.find((m: any) => m.schema === 'hive:');
    expect(hit).toBeTruthy();
    expect(hit?.url).toBe(HIVE_URI); // full link incl. trailing ".." padding
  });

  it('still detects https links', () => {
    const matches = makeLinkify().match('see https://hivesigner.com/sign/op/abc');
    expect(matches).toBeTruthy();
    expect(matches?.[0].url).toContain('https://hivesigner.com/sign/op/abc');
  });

  it('does not match plain text', () => {
    expect(makeLinkify().match('just a normal message')).toBeNull();
  });
});
