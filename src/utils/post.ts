export const getPostUrl = (urlPath: string): string => {
  const BASE_URL = 'https://ecency.com';
  return BASE_URL + urlPath;
};

/**
 * Strip the leading `/<category>/` segment from a Hive-style post path so the
 * URL matches ecency.com's canonical form `/@author/permlink` instead of the
 * legacy `/<category>/@author/permlink`. The web app currently 302s the legacy
 * form to the canonical one (and plans to make it permanent), so emitting the
 * canonical form directly avoids the redirect hop on shared/copied links and
 * keeps OG previews on the canonical URL.
 *
 * Safe to call with paths that already start with `/@…` (returned unchanged)
 * and with empty/null inputs (returned unchanged). Comment URLs with the
 * `…/@root-author/root-permlink#@comment-author/comment-permlink` fragment
 * form are handled correctly — only the leading category segment is stripped.
 */
export const stripCategoryFromPostPath = (urlPath: string | undefined | null): string => {
  if (!urlPath) {
    return '';
  }
  // Match a leading `/<category>/@` (category = one path segment, not starting
  // with `@`) and rewrite to `/@`. Anchored to the start so we never touch
  // anything past the first segment.
  return urlPath.replace(/^\/[^/@][^/]*\/@/, '/@');
};
