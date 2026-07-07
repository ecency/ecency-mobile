type ProfileLike = Record<string, unknown>;

/**
 * Pick the merge base for a partial profile update (e.g. pin-to-blog).
 *
 * The SDK's parseProfileMetadata returns a truthy empty object for
 * missing/empty/unparseable posting_json_metadata, so a plain `||` chain never
 * reaches its fallback. When a fetched account row carries no usable profile
 * (misbehaving node serving stripped metadata, or account not found), the last
 * known profile copy must win — otherwise a pin update shrinks the on-chain
 * profile down to the partial payload.
 */
export const resolveProfileMergeBase = (
  parsedProfile?: ProfileLike | null,
  fallbackProfile?: ProfileLike | null,
): ProfileLike => {
  if (parsedProfile && Object.keys(parsedProfile).length) {
    return parsedProfile;
  }
  return fallbackProfile || {};
};
