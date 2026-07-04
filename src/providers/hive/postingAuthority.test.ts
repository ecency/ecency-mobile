import {
  hasEcencyPostingAuthority,
  usesHivesignerTokenBroadcast,
  isMissingEcencyPostingAuthorityError,
  shouldPromptPostingAuthority,
} from './hive';
import AUTH_TYPE from '../../constants/authType';

const withAuths = (auths: any[]) => ({ posting: { account_auths: auths, weight_threshold: 1 } });

describe('posting authority helpers', () => {
  describe('hasEcencyPostingAuthority', () => {
    it('is true when ecency.app is present', () => {
      expect(hasEcencyPostingAuthority(withAuths([['ecency.app', 1]]))).toBe(true);
    });
    it('is false when absent or malformed', () => {
      expect(hasEcencyPostingAuthority(withAuths([['peakd.app', 1]]))).toBe(false);
      expect(hasEcencyPostingAuthority(withAuths([]))).toBe(false);
      expect(hasEcencyPostingAuthority({})).toBe(false);
      expect(hasEcencyPostingAuthority(null)).toBe(false);
    });
  });

  describe('usesHivesignerTokenBroadcast', () => {
    it('is true for HiveSigner (steemConnect) logins', () => {
      expect(usesHivesignerTokenBroadcast({ local: { authType: AUTH_TYPE.STEEM_CONNECT } })).toBe(
        true,
      );
    });
    it('is true for active-key-only logins that fall back to the token', () => {
      expect(
        usesHivesignerTokenBroadcast({
          local: { authType: AUTH_TYPE.ACTIVE_KEY, activeKey: 'enc', accessToken: 'tok' },
        }),
      ).toBe(true);
    });
    it('is false for key logins that hold a posting key (sign directly)', () => {
      expect(
        usesHivesignerTokenBroadcast({
          local: { authType: AUTH_TYPE.MASTER_KEY, postingKey: 'enc', accessToken: 'tok' },
        }),
      ).toBe(false);
    });
    it('is false for HiveAuth and unknown logins', () => {
      expect(usesHivesignerTokenBroadcast({ local: { authType: AUTH_TYPE.HIVE_AUTH } })).toBe(
        false,
      );
      expect(usesHivesignerTokenBroadcast({})).toBe(false);
    });
  });

  describe('isMissingEcencyPostingAuthorityError', () => {
    it('matches the HiveSigner unauthorized_client rejection', () => {
      expect(
        isMissingEcencyPostingAuthorityError({
          error: 'unauthorized_client',
          error_description: "The app @ecency.app doesn't have permission to broadcast for @user",
        }),
      ).toBe(true);
    });
    it('matches when only a stringified/wrapped message is available', () => {
      expect(
        isMissingEcencyPostingAuthorityError({
          message: "The app @ecency.app doesn't have permission to broadcast for @user",
        }),
      ).toBe(true);
    });
    it('does not match unrelated errors', () => {
      expect(isMissingEcencyPostingAuthorityError({ error: 'invalid_grant' })).toBe(false);
      expect(isMissingEcencyPostingAuthorityError(new Error('Insufficient RC'))).toBe(false);
      expect(isMissingEcencyPostingAuthorityError(null)).toBe(false);
    });
    it('does not match a bare unauthorized_client without the broadcast context', () => {
      expect(isMissingEcencyPostingAuthorityError({ error: 'unauthorized_client' })).toBe(false);
      expect(
        isMissingEcencyPostingAuthorityError({
          error: 'unauthorized_client',
          error_description: 'The token has expired',
        }),
      ).toBe(false);
    });
  });

  describe('shouldPromptPostingAuthority', () => {
    it('prompts token-broadcast users lacking the authority', () => {
      expect(
        shouldPromptPostingAuthority({
          local: { authType: AUTH_TYPE.STEEM_CONNECT },
          ...withAuths([]),
        }),
      ).toBe(true);
    });
    it('prompts HiveAuth users lacking the authority', () => {
      expect(
        shouldPromptPostingAuthority({
          local: { authType: AUTH_TYPE.HIVE_AUTH },
          ...withAuths([]),
        }),
      ).toBe(true);
    });
    it('does not prompt once the authority exists', () => {
      expect(
        shouldPromptPostingAuthority({
          local: { authType: AUTH_TYPE.STEEM_CONNECT },
          ...withAuths([['ecency.app', 1]]),
        }),
      ).toBe(false);
    });
    it('does not prompt direct-signing key users', () => {
      expect(
        shouldPromptPostingAuthority({
          local: { authType: AUTH_TYPE.POSTING_KEY, postingKey: 'enc' },
          ...withAuths([]),
        }),
      ).toBe(false);
    });
  });
});
