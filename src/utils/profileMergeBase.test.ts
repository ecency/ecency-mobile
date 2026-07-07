import { resolveProfileMergeBase } from './profileMergeBase';

describe('resolveProfileMergeBase', () => {
  const fullProfile = {
    name: 'Full Name',
    about: 'bio',
    profile_image: 'https://example.com/avatar.jpg',
    pinned: 'some-post',
    version: 2,
  };

  it('returns the parsed on-chain profile when it has keys', () => {
    expect(resolveProfileMergeBase(fullProfile, { name: 'Stale' })).toBe(fullProfile);
  });

  it('falls back to the last known profile when the parsed profile is empty', () => {
    // parseProfileMetadata returns {} (truthy) for empty/stripped metadata —
    // a `||` chain would keep the empty object and wipe the profile on pin.
    expect(resolveProfileMergeBase({}, fullProfile)).toBe(fullProfile);
  });

  it('falls back to the last known profile when the account fetch returned nothing', () => {
    expect(resolveProfileMergeBase(undefined, fullProfile)).toBe(fullProfile);
    expect(resolveProfileMergeBase(null, fullProfile)).toBe(fullProfile);
  });

  it('returns an empty object when no profile is known anywhere', () => {
    expect(resolveProfileMergeBase({}, undefined)).toEqual({});
    expect(resolveProfileMergeBase(undefined, null)).toEqual({});
  });
});
