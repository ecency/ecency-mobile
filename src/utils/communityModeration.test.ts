import { getCommunityRole, isCommunityModerator, MODERATOR_ROLES } from './communityModeration';

// Shape mirrors what hivemind returns for `community.team`: [account, role, title].
const TEAM = [
  ['hive-125125', 'owner', ''],
  ['alice', 'admin', 'Head mod'],
  ['bob', 'mod', ''],
  ['carol', 'member', ''],
  ['dave', 'guest', ''],
  ['erin', 'muted', ''],
];

describe('getCommunityRole', () => {
  it('reads the role out of a positional tuple', () => {
    expect(getCommunityRole(TEAM, 'alice')).toBe('admin');
    expect(getCommunityRole(TEAM, 'bob')).toBe('mod');
    expect(getCommunityRole(TEAM, 'erin')).toBe('muted');
  });

  it('returns undefined for an account that is not on the team', () => {
    expect(getCommunityRole(TEAM, 'frank')).toBeUndefined();
  });

  it('returns undefined when team or username is missing', () => {
    expect(getCommunityRole(undefined, 'alice')).toBeUndefined();
    expect(getCommunityRole(TEAM, undefined)).toBeUndefined();
    expect(getCommunityRole([], 'alice')).toBeUndefined();
  });

  it('does not match an account name against the role column', () => {
    expect(getCommunityRole(TEAM, 'mod')).toBeUndefined();
  });
});

describe('isCommunityModerator', () => {
  it.each(MODERATOR_ROLES)('is true for %s', (role) => {
    expect(isCommunityModerator([['alice', role, '']], 'alice')).toBe(true);
  });

  it.each(['member', 'guest', 'muted'])('is false for %s', (role) => {
    expect(isCommunityModerator([['alice', role, '']], 'alice')).toBe(false);
  });

  it('is false for an account that is not on the team', () => {
    expect(isCommunityModerator(TEAM, 'frank')).toBe(false);
  });

  it('is false when team or username is missing', () => {
    expect(isCommunityModerator(undefined, 'alice')).toBe(false);
    expect(isCommunityModerator(TEAM, undefined)).toBe(false);
  });

  it('is false for a malformed tuple rather than throwing', () => {
    expect(isCommunityModerator([[], ['alice']] as string[][], 'alice')).toBe(false);
  });

  it('regression: object-shaped members are not treated as moderators', () => {
    // The previous implementation read `member.account` / `member.role`, which
    // are always undefined on a tuple. Guard against a revert to that shape.
    const objectTeam = [{ account: 'alice', role: 'mod' }] as unknown as string[][];
    expect(isCommunityModerator(objectTeam, 'alice')).toBe(false);
  });
});
