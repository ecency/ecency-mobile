import {
  enforceThreeSpeakBeneficiary,
  hasThreeSpeakEmbed,
  isThreeSpeakBeneficiary,
  THREESPEAK_BENEFICIARY_ACCOUNT,
  THREESPEAK_BENEFICIARY_WEIGHT,
} from '@ecency/sdk';

// The rule itself lives in @ecency/sdk and is covered exhaustively by its own spec
// (packages/sdk/src/modules/integrations/3speak/functions/beneficiary.spec.ts). Re-testing the
// regex here would only duplicate that.
//
// What this file covers is what the SDK's own tests cannot: that the exports actually resolve
// through this app's module setup, and that the payout values are the ones mobile expects. A
// broken export path or a silently changed weight would otherwise only surface at publish
// time, on chain.
describe('3Speak beneficiary, via @ecency/sdk', () => {
  it('resolves every symbol the app imports', () => {
    expect(typeof hasThreeSpeakEmbed).toBe('function');
    expect(typeof enforceThreeSpeakBeneficiary).toBe('function');
    expect(typeof isThreeSpeakBeneficiary).toBe('function');
  });

  // A payout contract shared with the web app and with 3Speak. Written out literally rather
  // than compared against the imported constant, which would pass either way.
  it('still pays threespeakfund 11%', () => {
    expect(THREESPEAK_BENEFICIARY_ACCOUNT).toBe('threespeakfund');
    expect(THREESPEAK_BENEFICIARY_WEIGHT).toBe(1100);
  });

  it('attaches the route to a post that embeds a video', () => {
    const body = 'Video: https://play.3speak.tv/embed?v=user/abcd1234';
    expect(enforceThreeSpeakBeneficiary([{ account: 'alice', weight: 500 }], body)).toEqual([
      { account: 'alice', weight: 500 },
      { account: 'threespeakfund', weight: 1100 },
    ]);
  });

  it('leaves a post without a video alone', () => {
    const list = [{ account: 'alice', weight: 500 }];
    expect(enforceThreeSpeakBeneficiary(list, 'Just a regular post')).toBe(list);
  });

  // Guards the two defects fixed in sdk 2.3.67, so a future SDK bump that regressed either
  // would fail here rather than misrouting or silently dropping the 11%.
  it('ignores a lookalike domain but accepts an uppercase host', () => {
    expect(hasThreeSpeakEmbed('https://fake3speak.tv/embed?v=x')).toBe(false);
    expect(hasThreeSpeakEmbed('https://PLAY.3speak.tv/embed?v=user/abc')).toBe(true);
  });
});
