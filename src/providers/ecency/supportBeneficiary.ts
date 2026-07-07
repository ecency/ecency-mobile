/**
 * Voluntary "Support Ecency" post beneficiary helper.
 *
 * Users can opt in to give a percent of their post rewards to @ecency as a
 * post beneficiary on their new posts. The preference is stored on the
 * backend (see getSupportSettings/setSupportSettings in ./ecency.ts) as an
 * integer percent 0-100 where 0 means off.
 */

export const ECENCY_SUPPORT_ACCOUNT = 'ecency';

/** Default suggested support percent used by one-tap actions and toggles. */
export const DEFAULT_SUPPORT_PERCENT = 5;

/** Preset percents for the post beneficiary opt-in. */
export const SUPPORT_BENEFICIARY_PERCENTS = [1, 5, 10, 25];

/** Preset percents for the curation reward holdback opt-in. */
export const SUPPORT_CURATION_PERCENTS = [5, 10, 25, 50, 100];

/** Hive allows at most 8 beneficiary routes per comment_options. */
const MAX_BENEFICIARY_ROUTES = 8;

/** Total beneficiary weight cannot exceed 100% (10000 basis points). */
const MAX_TOTAL_WEIGHT = 10000;

interface BeneficiaryRoute {
  account: string;
  weight: number;
  src?: string;
}

/**
 * Returns `beneficiaries` with `{ account: 'ecency', weight: percent * 100 }`
 * appended when `percent > 0`.
 *
 * Rules:
 * - percent 0 (or invalid) returns the input unchanged
 * - an existing ecency route always wins: the input is returned unchanged so
 *   an explicit user-chosen weight (higher OR lower than the saved percent)
 *   is never overridden at publish time
 * - injection is skipped (input returned unchanged) when the result would
 *   exceed 8 routes or 10000 total weight
 * - the input array is never mutated
 */
export function injectEcencySupportBeneficiary(
  beneficiaries: BeneficiaryRoute[],
  percent: number,
): BeneficiaryRoute[] {
  if (!Number.isFinite(percent) || percent <= 0) {
    return beneficiaries;
  }

  if (beneficiaries.some((item) => item.account === ECENCY_SUPPORT_ACCOUNT)) {
    return beneficiaries;
  }

  const weight = Math.floor(percent * 100);
  const next = [...beneficiaries, { account: ECENCY_SUPPORT_ACCOUNT, weight }];

  if (next.length > MAX_BENEFICIARY_ROUTES) {
    return beneficiaries;
  }

  const totalWeight = next.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight > MAX_TOTAL_WEIGHT) {
    return beneficiaries;
  }

  return next;
}
