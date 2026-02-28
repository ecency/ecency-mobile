type RootTarget = {
  rootAuthor: string;
  rootPermlink: string;
};

const parseRootFromUrl = (url?: string): RootTarget | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Matches the root post segment in urls like:
  // /category/@root-author/root-permlink#@comment-author/comment-permlink
  const match = url.match(/\/@([\w.-]+)\/([^#/?]+)/i);
  if (!match) {
    return null;
  }

  const [, rootAuthor, rootPermlink] = match;
  if (!rootAuthor || !rootPermlink) {
    return null;
  }

  return { rootAuthor, rootPermlink };
};

/**
 * Derives root discussion target for reply/comment mutations.
 *
 * Priority:
 * 1) explicit root_author/root_permlink on entry
 * 2) root parsed from entry url
 * 3) depth=1 comment parent_author/parent_permlink (root post for first-level comments)
 * 4) provided fallback (usually immediate parent)
 */
export const deriveDiscussionRoot = (
  entry: any,
  fallbackAuthor: string,
  fallbackPermlink: string,
): RootTarget => {
  if (entry?.root_author && entry?.root_permlink) {
    return {
      rootAuthor: entry.root_author,
      rootPermlink: entry.root_permlink,
    };
  }

  const fromUrl = parseRootFromUrl(entry?.url);
  if (fromUrl) {
    return fromUrl;
  }

  const depth = Number(entry?.depth);
  if (
    depth === 1 &&
    typeof entry?.parent_author === 'string' &&
    typeof entry?.parent_permlink === 'string' &&
    entry.parent_author &&
    entry.parent_permlink
  ) {
    return {
      rootAuthor: entry.parent_author,
      rootPermlink: entry.parent_permlink,
    };
  }

  return {
    rootAuthor: fallbackAuthor,
    rootPermlink: fallbackPermlink,
  };
};
