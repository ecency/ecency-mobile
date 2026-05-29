import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { getSimilarEntriesQueryOptions, SIMILAR_ENTRIES_MIN_RENDER } from '@ecency/sdk';

import SimilarEntryItem from '../children/similarEntryItem';
import styles from '../styles/similarEntries.styles';

// The horizontal strip renders at most this many cards.
const MAX_RESULTS = 2;

interface Post {
  author: string;
  permlink: string;
  title?: string;
  body?: string;
  depth?: number;
  parent_author?: string;
  json_metadata?: {
    tags?: string[];
  };
}

interface Props {
  post?: Post | null;
}

// "Read next" recommendations. Shares the SDK's Elasticsearch more_like_this
// query with the web client (getSimilarEntriesQueryOptions): content-based
// related posts, recency-scoped, deduped and capped in the SDK. Only rendered
// for top-level posts and when at least the shared minimum survive.
const SimilarEntries = ({ post }: Props) => {
  const intl = useIntl();

  const isTopLevel = !!post && !post.parent_author && (post.depth ?? 0) === 0;

  const { data } = useQuery({
    ...getSimilarEntriesQueryOptions({
      author: post?.author ?? '',
      permlink: post?.permlink ?? '',
      title: post?.title,
      body: post?.body,
      json_metadata: { tags: post?.json_metadata?.tags },
    }),
    enabled: isTopLevel && !!post?.author && !!post?.permlink,
  });

  const entries = useMemo(() => (Array.isArray(data) ? data.slice(0, MAX_RESULTS) : []), [data]);

  if (!isTopLevel) return null;
  if (entries.length < SIMILAR_ENTRIES_MIN_RENDER) return null;

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
