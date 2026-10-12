import { isWaveHiddenForNsfw } from './waveNsfw';

const flagged = { author: 'bob', nsfw: true };

describe('isWaveHiddenForNsfw', () => {
  it('keeps a wave the API did not flag, whatever the setting', () => {
    ['0', '1', '2', undefined].forEach((setting) => {
      expect(isWaveHiddenForNsfw({ author: 'bob' }, setting, 'alice')).toBe(false);
      expect(isWaveHiddenForNsfw({ author: 'bob', nsfw: false }, setting, 'alice')).toBe(false);
    });
  });

  it('reads the boolean only: an odd flag is not a verdict', () => {
    ['true', 1, {}, null].forEach((nsfw) => {
      expect(isWaveHiddenForNsfw({ author: 'bob', nsfw }, '2', 'alice')).toBe(false);
    });
    expect(isWaveHiddenForNsfw(null, '2', 'alice')).toBe(false);
    expect(isWaveHiddenForNsfw(undefined, '2', 'alice')).toBe(false);
  });

  it('keeps a flagged wave for a viewer who chose to always show NSFW', () => {
    expect(isWaveHiddenForNsfw(flagged, '0', 'alice')).toBe(false);
  });

  it('hides a flagged wave under warn and under hide', () => {
    // The comment list has no warning placeholder, so warn must not show the picture.
    expect(isWaveHiddenForNsfw(flagged, '1', 'alice')).toBe(true);
    expect(isWaveHiddenForNsfw(flagged, '2', 'alice')).toBe(true);
  });

  it('hides it when the setting was never stored, and for a logged out viewer', () => {
    expect(isWaveHiddenForNsfw(flagged, undefined, 'alice')).toBe(true);
    expect(isWaveHiddenForNsfw(flagged, '', undefined)).toBe(true);
    expect(isWaveHiddenForNsfw(flagged, '1', null)).toBe(true);
  });

  it("never hides the viewer's own wave", () => {
    expect(isWaveHiddenForNsfw(flagged, '2', 'bob')).toBe(false);
    expect(isWaveHiddenForNsfw(flagged, '1', 'bob')).toBe(false);
  });
});
