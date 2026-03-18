import { THREESPEAK_BENEFICIARY_ACCOUNT, THREESPEAK_BENEFICIARY_WEIGHT } from './constants';

interface BeneficiaryRoute {
  account: string;
  weight: number;
  src?: string;
}

/** Returns true if the post body contains a 3Speak embed URL. */
export function hasThreeSpeakEmbed(body: string): boolean {
  return /https?:\/\/[a-z.]*3speak\.tv\/embed[?/]/.test(body);
}

/**
 * Ensures the `threespeakfund` beneficiary (11 %) is present when the post
 * body contains a 3Speak embed. Existing beneficiaries are preserved;
 * duplicates and wrong weights are normalised.
 */
export function enforceThreeSpeakBeneficiary(
  beneficiaries: BeneficiaryRoute[],
  body: string,
): BeneficiaryRoute[] {
  if (!hasThreeSpeakEmbed(body)) {
    return beneficiaries;
  }

  const existing = beneficiaries.find((b) => b.account === THREESPEAK_BENEFICIARY_ACCOUNT);

  // Already correct
  if (existing && existing.weight === THREESPEAK_BENEFICIARY_WEIGHT) {
    return beneficiaries;
  }

  // Existing but wrong weight — normalise
  if (existing) {
    return beneficiaries.map((b) =>
      b.account === THREESPEAK_BENEFICIARY_ACCOUNT
        ? { ...b, weight: THREESPEAK_BENEFICIARY_WEIGHT }
        : b,
    );
  }

  // Missing — add it
  return [
    ...beneficiaries,
    { account: THREESPEAK_BENEFICIARY_ACCOUNT, weight: THREESPEAK_BENEFICIARY_WEIGHT },
  ];
}

/** Helper to check if a beneficiary is the 3Speak account. */
export function isThreeSpeakBeneficiary(account: string): boolean {
  return account === THREESPEAK_BENEFICIARY_ACCOUNT;
}
