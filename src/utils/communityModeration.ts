import { ROLES } from '@ecency/sdk';
import type { CommunityTeam } from '@ecency/sdk';

// `CommunityTeam` is `Array<Array<string>>` - hivemind returns each team member
// as a positional tuple, not an object. Reading `member.account` / `member.role`
// yields `undefined` and silently disables every moderator gate, so all access
// to the team goes through these helpers.
const ACCOUNT_INDEX = 0;
const ROLE_INDEX = 1;

// Roles that carry moderation authority on chain. `member`, `guest` and `muted`
// do not.
export const MODERATOR_ROLES: string[] = [ROLES.OWNER, ROLES.ADMIN, ROLES.MOD];

/**
 * Returns the community role of `username`, or undefined when the account is
 * not on the team.
 */
export const getCommunityRole = (team?: CommunityTeam, username?: string): string | undefined => {
  if (!team || !username) {
    return undefined;
  }

  return team.find((member) => member?.[ACCOUNT_INDEX] === username)?.[ROLE_INDEX];
};

/**
 * True when `username` is an owner, admin or mod of the community.
 *
 * This gates UI affordances only. Hivemind replays the operation and is the
 * only authority on whether the action is accepted, so a stale or missing team
 * never grants more than it should - but it can wrongly withhold an action, and
 * moderator authority does not depend on being subscribed.
 */
export const isCommunityModerator = (team?: CommunityTeam, username?: string): boolean =>
  MODERATOR_ROLES.includes(getCommunityRole(team, username) ?? '');
