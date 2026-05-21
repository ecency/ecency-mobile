import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '@ecency/sdk';

import SimilarEntryItem from '../children/similarEntryItem';
import styles from '../styles/similarEntries.styles';

// Show the strip only when at least this many results survive filtering.
// One lone card looks like a glitch; two reads as intentional.
const MIN_RENDER = 2;
const MAX_RESULTS = 2;

// 6-month recency window — matches the search-api contract used on web.
const SINCE_MS = 182 * 24 * 60 * 60 * 1000;

// Overly broad tags worth skipping when something more specific is available.
const GENERIC_TAGS = new Set([
  'hive',
  'blog',
  'life',
  'blogger',
  'dailyblog',
  'post',
  'ecency',
  'esteem',
]);

// Adult-content tags filtered client-side as a backstop to the server-side
// default filter (server excludes `nsfw`/`dporn` + the broken `is_nsfw` flag).
// Client-side check guards against any tag-set drift between server and client.
const ADULT_TAGS = new Set(['nsfw', 'dporn']);

// Hive tags are lowercase alphanumeric, optional hyphens, no spaces or
// punctuation. Reject anything else so untrusted json_metadata can't inject
// query operators (e.g. a tag containing a colon or space).
const SAFE_TAG = /^[a-z0-9][a-z0-9-]{0,49}$/;

interface Post {
  author: string;
  permlink: string;
  depth?: number;
  parent_author?: string;
  json_metadata?: {
    tags?: string[];
  };
}

interface Props {
  post?: Post | null;
}

interface SearchApiRow {
  author: string;
  permlink: string;
  title?: string;
  img_url?: string;
  created_at?: string;
  tags?: string[];
}

interface SearchApiResponse {
  hits: number;
  took: number;
  results: SearchApiRow[];
}

/**
 * Returns a query string when there is at least one usable similarity signal
 * (tags or permlink slug tokens). Returns an empty string when nothing
 * specific is available, so the caller can disable the query rather than
 * firing a corpus-wide `* type:post` fetch.
 */
function buildQuery(post: Post): string {
  const tagsRaw = Array.isArray(post.json_metadata?.tags) ? post.json_metadata!.tags! : [];
  const cleaned = tagsRaw
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => SAFE_TAG.test(t))
    .filter((t) => !t.startsWith('hive-'));
  const specific = cleaned.filter((t) => !GENERIC_TAGS.has(t));
  const chosen = (specific.length > 0 ? specific : cleaned).slice(0, 2);

  if (chosen.length > 0) {
    return `* type:post tag:${chosen.join(',')}`;
  }

  // Fall back to permlink slug tokens when the post has no tag metadata.
  const fromPermlink = post.permlink
    .toLowerCase()
    .split('-')
    .filter((part) => SAFE_TAG.test(part) && !/^-?\d+$/.test(part) && part.length > 2)
    .slice(0, 2)
    .join(',');

  return fromPermlink ? `* type:post tag:${fromPermlink}` : '';
}

const SimilarEntries = ({ post }: Props) => {
  const intl = useIntl();

  const isTopLevel = !!post && !post.parent_author && (post.depth ?? 0) === 0;

  const query = useMemo(() => (post ? buildQuery(post) : ''), [post]);

  const { data } = useQuery<SearchApiRow[]>({
    queryKey: ['similar-entries-mobile', post?.author, post?.permlink, query],
    queryFn: async ({ signal }) => {
      const sinceMs = Date.now() - SINCE_MS;
      const since = new Date(sinceMs).toISOString().slice(0, 19);

      const response = await fetch(`${CONFIG.privateApiHost}/search-api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, sort: 'popularity', hide_low: false, since }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Similar entries search failed: ${response.status}`);
      }

      const json = (await response.json()) as SearchApiResponse;
      return Array.isArray(json.results) ? json.results : [];
    },
    enabled: isTopLevel && !!post?.author && !!post?.permlink && query.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const entries = useMemo(() => {
    if (!Array.isArray(data) || !post) return [];
    const seenAuthors = new Set<string>();
    return data.reduce<SearchApiRow[]>((acc, r) => {
      if (acc.length >= MAX_RESULTS) return acc;
      if (!r || typeof r.author !== 'string' || typeof r.permlink !== 'string') return acc;
      // The source post is uniquely identified by (author, permlink); permlinks
      // alone can collide across authors.
      if (r.author === post.author && r.permlink === post.permlink) return acc;
      if ((r.tags ?? []).some((t) => ADULT_TAGS.has(t))) return acc;
      if (seenAuthors.has(r.author)) return acc;
      seenAuthors.add(r.author);
      acc.push(r);
      return acc;
    }, []);
  }, [data, post]);

  if (!isTopLevel) return null;
  if (entries.length < MIN_RENDER) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'similar_entries.title', defaultMessage: 'Read next' })}
        </Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={entries}
        keyExtractor={(it) => `${it.author}/${it.permlink}`}
        renderItem={({ item }) => <SimilarEntryItem entry={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default SimilarEntries;
