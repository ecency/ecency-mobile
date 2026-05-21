import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { getSimilarEntriesQueryOptions, SIMILAR_ENTRIES_MIN_RENDER } from '@ecency/sdk';

import SimilarEntryItem from '../children/similarEntryItem';
import styles from '../styles/similarEntries.styles';

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

interface SdkSimilarRow {
  author?: string;
  permlink?: string;
  title?: string;
  img_url?: string;
  created_at?: string;
}

const SimilarEntries = ({ post }: Props) => {
  const intl = useIntl();

  // Top-level posts only — skip comments / wave replies.
  const isTopLevel = !!post && !post.parent_author && (post.depth ?? 0) === 0;

  const { data: raw } = useQuery({
    ...getSimilarEntriesQueryOptions({
      author: post?.author ?? '',
      permlink: post?.permlink ?? '',
      json_metadata: { tags: post?.json_metadata?.tags },
    }),
    enabled: isTopLevel && !!post?.author && !!post?.permlink,
  });

  // Mobile shows a tighter strip than web (2 cards instead of 3) — keeps the
  // post body above the fold on small screens. SDK still caps at 3.
  const entries = useMemo(() => {
    if (!Array.isArray(raw)) return [];
    return (raw as SdkSimilarRow[])
      .filter((r) => r && typeof r.author === 'string' && typeof r.permlink === 'string')
      .slice(0, 2);
  }, [raw]);

  if (!isTopLevel) return null;
  if (entries.length < SIMILAR_ENTRIES_MIN_RENDER) return null;

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
        renderItem={({ item }) => <SimilarEntryItem entry={item as any} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default SimilarEntries;
