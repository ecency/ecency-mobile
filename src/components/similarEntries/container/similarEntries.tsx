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

// 6-month recency window — matches the SDK contract used on web.
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

function buildQuery(post: Post): string {
  let q = '* type:post';

  const tagsRaw = Array.isArray(post.json_metadata?.tags) ? post.json_metadata!.tags! : [];
  const cleaned = tagsRaw
    .filter((t): t is string => typeof t === 'string' && t !== '')
    .filter((t) => !t.startsWith('hive-'));
  const specific = cleaned.filter((t) => !GENERIC_TAGS.has(t));
  const chosen = (specific.length > 0 ? specific : cleaned).slice(0, 2);

  if (chosen.length > 0) {
    q += ` tag:${chosen.join(',')}`;
  } else {
    // Fall back to permlink slug tokens when the post has no tag metadata.
    const fromPermlink = post.permlink
      .split('-')
      .filter((part) => part && !/^-?\d+$/.test(part) && part.length > 2)
      .slice(0, 2)
      .join(',');
    if (fromPermlink) {
      q += ` tag:${fromPermlink}`;
    }
  }

  return q;
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
    const out: SearchApiRow[] = [];
    for (const r of data) {
      if (!r || typeof r.author !== 'string' || typeof r.permlink !== 'string') continue;
      if (r.permlink === post.permlink) continue;
      if ((r.tags ?? []).indexOf('nsfw') !== -1) continue;
      if (seenAuthors.has(r.author)) continue;
      seenAuthors.add(r.author);
      out.push(r);
      if (out.length >= MAX_RESULTS) break;
    }
    return out;
  }, [data, post]);

  if (!isTopLevel) return null;
  if (entries.length < MIN_RENDER) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'similar_entries.title' })}</Text>
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
