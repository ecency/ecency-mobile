import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Placeholder from 'rn-placeholder';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Image as ExpoImage } from 'expo-image';
import { useGetPostQuery } from '../../../providers/queries/postQueries/postQueries';
import styles from '../styles/linkPreview.styles';

interface LinkPreviewProps {
  title?: string;
  summary?: string;
  imageUrl?: string;
  contentWidth: number;
  onPress: () => void;
  url?: string;
  label?: string; // Optional label to display (e.g., "HIVE POST" or domain name)
}

export const LinkPreview = ({
  title,
  summary,
  imageUrl,
  contentWidth,
  onPress,
  url,
  label,
}: LinkPreviewProps) => {
  const _containerStyle = { ...styles.container, width: contentWidth };

  // Extract domain name from URL if label is not provided
  const getDomainLabel = (): string => {
    if (label) return label;
    if (!url) return 'LINK';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '').toUpperCase();
    } catch {
      return 'LINK';
    }
  };

  const _renderPlaceholder = (
    <Placeholder.Box
      color={EStyleSheet.value('$primaryLightBackground')}
      animate="fade"
      height={12}
      width={contentWidth - 92}
    />
  );

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={_containerStyle}>
        {imageUrl ? (
          <ExpoImage source={{ uri: imageUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.hivePost}>{getDomainLabel()}</Text>
          {!title ? (
            _renderPlaceholder
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          {!summary ? (
            _renderPlaceholder
          ) : (
            <Text style={styles.body} numberOfLines={1}>
              {summary}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface LinkMeta {
  title?: string;
  summary?: string;
  image?: string;
}

interface HiveLinkPreviewProps {
  author: string;
  permlink: string;
  linkMeta?: LinkMeta;
  contentWidth: number;
  onPress: () => void;
  url?: string;
}

export const HiveLinkPreview = ({
  author,
  permlink,
  linkMeta,
  contentWidth,
  onPress,
  url,
}: HiveLinkPreviewProps) => {
  // Optionally use post query to get post data if linkMeta is not provided
  const getPostQuery = !linkMeta ? useGetPostQuery({ author, permlink, isPreview: true }) : null;

  const title = linkMeta?.title || getPostQuery?.data?.title || '';
  const summary = linkMeta?.summary || getPostQuery?.data?.summary || '';
  const imageUrl = linkMeta?.image || getPostQuery?.data?.image || '';

  return (
    <LinkPreview
      title={title}
      summary={summary}
      imageUrl={imageUrl}
      contentWidth={contentWidth}
      onPress={onPress}
      url={url}
      label="HIVE POST"
    />
  );
};
