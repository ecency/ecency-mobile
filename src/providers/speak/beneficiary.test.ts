import {
  enforceThreeSpeakBeneficiary,
  hasThreeSpeakEmbed,
  isThreeSpeakBeneficiary,
} from './beneficiary';
import { THREESPEAK_BENEFICIARY_ACCOUNT, THREESPEAK_BENEFICIARY_WEIGHT } from './constants';

// Mirrors apps/web/src/specs/features/3speak/beneficiaries.spec.ts in vision-next. The module
// is duplicated across the two apps, so the behaviour is pinned on both sides until it moves
// into @ecency/sdk.
//
// Expected values are written out literally rather than imported from the constants: asserting
// against the constant would still pass if the constant itself were changed by mistake, which
// is the regression these tests exist to catch.
describe('3Speak embed beneficiaries', () => {
  describe('hasThreeSpeakEmbed', () => {
    it('detects an embed URL in ?v= form', () => {
      expect(hasThreeSpeakEmbed('Watch: https://play.3speak.tv/embed?v=user/abcd1234')).toBe(true);
    });

    it('detects an embed URL in path form', () => {
      expect(hasThreeSpeakEmbed('https://play.3speak.tv/embed/user/abc123')).toBe(true);
    });

    it('detects an embed URL on any subdomain', () => {
      expect(
        hasThreeSpeakEmbed('<iframe src="https://cdn.3speak.tv/embed?v=user/abc"></iframe>'),
      ).toBe(true);
    });

    it('does not match a plain text mention without a URL', () => {
      expect(hasThreeSpeakEmbed('check out 3speak.tv/embed for more info')).toBe(false);
    });

    it('does not match a URL without a protocol', () => {
      expect(hasThreeSpeakEmbed('visit play.3speak.tv/embed?v=user/abc')).toBe(false);
    });

    it('returns false for empty or unrelated content', () => {
      expect(hasThreeSpeakEmbed('')).toBe(false);
      expect(hasThreeSpeakEmbed('Hello world, this is a blog post')).toBe(false);
    });

    // Pins the contract with 3Speak: detection requires an `/embed` path segment. A url shaped
    // differently is not recognised, and the 11% route would silently not be attached. If
    // 3Speak ever changes the embed url it returns, this is the test that should fail.
    it('requires an /embed path segment', () => {
      expect(hasThreeSpeakEmbed('https://embed.3speak.tv/watch?v=user/abc')).toBe(false);
      expect(hasThreeSpeakEmbed('https://3speak.tv/watch?v=user/abc')).toBe(false);
    });
  });

  describe('enforceThreeSpeakBeneficiary', () => {
    const bodyWithEmbed = 'Video: https://play.3speak.tv/embed?v=user/abcd1234';
    const bodyWithoutEmbed = 'Just a regular post';

    it('returns the original list untouched when there is no embed', () => {
      const list = [{ account: 'alice', weight: 500 }];
      expect(enforceThreeSpeakBeneficiary(list, bodyWithoutEmbed)).toBe(list);
    });

    it('appends threespeakfund at 11% when an embed is present', () => {
      expect(
        enforceThreeSpeakBeneficiary([{ account: 'alice', weight: 500 }], bodyWithEmbed),
      ).toEqual([
        { account: 'alice', weight: 500 },
        { account: 'threespeakfund', weight: 1100 },
      ]);
    });

    it('adds it to an empty list', () => {
      expect(enforceThreeSpeakBeneficiary([], bodyWithEmbed)).toEqual([
        { account: 'threespeakfund', weight: 1100 },
      ]);
    });

    it('normalises an existing entry that carries the wrong weight', () => {
      expect(
        enforceThreeSpeakBeneficiary(
          [
            { account: 'alice', weight: 500 },
            { account: 'threespeakfund', weight: 500 },
          ],
          bodyWithEmbed,
        ),
      ).toEqual([
        { account: 'alice', weight: 500 },
        { account: 'threespeakfund', weight: 1100 },
      ]);
    });

    it('returns the original list when the entry is already correct', () => {
      const list = [
        { account: 'alice', weight: 500 },
        { account: 'threespeakfund', weight: 1100 },
      ];
      expect(enforceThreeSpeakBeneficiary(list, bodyWithEmbed)).toBe(list);
    });

    it('preserves the other beneficiaries and does not mutate the input', () => {
      const list = [{ account: 'alice', weight: 500 }];
      const snapshot = JSON.parse(JSON.stringify(list));
      enforceThreeSpeakBeneficiary(list, bodyWithEmbed);
      expect(list).toEqual(snapshot);
    });
  });

  describe('isThreeSpeakBeneficiary', () => {
    it('recognises the 3Speak account', () => {
      expect(isThreeSpeakBeneficiary('threespeakfund')).toBe(true);
    });

    it('rejects any other account', () => {
      expect(isThreeSpeakBeneficiary('alice')).toBe(false);
      expect(isThreeSpeakBeneficiary('')).toBe(false);
    });
  });

  // The values are a payout contract shared with the web app and with 3Speak. Changing either
  // here alone would silently misroute revenue on one platform.
  describe('constants', () => {
    it('pays threespeakfund 11%', () => {
      expect(THREESPEAK_BENEFICIARY_ACCOUNT).toBe('threespeakfund');
      expect(THREESPEAK_BENEFICIARY_WEIGHT).toBe(1100);
    });
  });
});
