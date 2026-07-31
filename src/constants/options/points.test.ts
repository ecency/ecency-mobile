import POINTS, { BURN_TYPE, resolvePointType } from './points';

/**
 * Type 997 covers BOTH halves of a burn: the debit and its refund. A burn has no
 * counterparty at all -- that absence is what separates it from a treasury transfer
 * -- so the sign of the amount is the only signal, and mapping 997 straight to the
 * spend label puts "AI usage" next to a credit.
 */
describe('resolvePointType', () => {
  it('labels a burn as AI usage', () => {
    expect(resolvePointType({ type: BURN_TYPE, amount: '-15.000' }).textKey).toBe('burned_title');
  });

  it('labels a refunded burn as a refund, not as usage', () => {
    expect(resolvePointType({ type: BURN_TYPE, amount: '15.000' }).textKey).toBe(
      'burn_refund_title',
    );
  });

  it('treats a numeric amount the same as a string one', () => {
    // The API sends formatted strings, but callers spread arbitrary shapes in.
    expect(resolvePointType({ type: BURN_TYPE, amount: 15 }).textKey).toBe('burn_refund_title');
    expect(resolvePointType({ type: BURN_TYPE, amount: -15 }).textKey).toBe('burned_title');
  });

  it('leaves other types alone regardless of sign', () => {
    // Only 997 is ambiguous; transfers carry a counterparty that already says which
    // direction they went.
    expect(resolvePointType({ type: 998, amount: '-5.000' })).toBe(POINTS[998]);
    expect(resolvePointType({ type: 999, amount: '5.000' })).toBe(POINTS[999]);
  });

  it('falls back to the default entry for an unknown type', () => {
    expect(resolvePointType({ type: 12345, amount: '1.000' })).toBe(POINTS.default);
  });

  it('does not throw on a malformed item', () => {
    expect(resolvePointType({}).textKey).toBe(POINTS.default.textKey);
    expect(resolvePointType(null as any).textKey).toBe(POINTS.default.textKey);
  });
});
