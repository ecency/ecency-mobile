import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Placeholder from 'rn-placeholder';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Image as ExpoImage } from 'expo-image';
import { useGetPostQuery } from '../../../providers/queries/postQueries/postQueries';
import styles from '../styles/linkPreview.styles';

interface LinkPreviewProps {
  author: string;
  permlink: string;
  linkMeta: any;
  contentWidth: number;
  onPress: () => void;
}

export const LinkPreview = ({
  author,
  permlink,
  linkMeta,
  contentWidth,
  onPress,
}: LinkPreviewProps) => {
  const _containerStyle = { ...styles.container, width: contentWidth };

  // optionally use post query to get post data if linkMeta is not provided
  const getPostQuery = !linkMeta ? useGetPostQuery({ author, permlink, isPreview: true }) : null;

  const _linkMeta = linkMeta || {
    title: getPostQuery?.data?.title,
    summary: getPostQuery?.data?.summary,
    image: getPostQuery?.data?.image,
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
        <ExpoImage source={{ uri: _linkMeta.image }} style={styles.thumbnail} />
        <View style={styles.textContainer}>
          <Text style={styles.hivePost}>HIVE POST</Text>
          {!_linkMeta.title ? (
            _renderPlaceholder
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {_linkMeta.title}
            </Text>
          )}
          {!_linkMeta.summary ? (
            _renderPlaceholder
          ) : (
            <Text style={styles.body} numberOfLines={1}>
              {_linkMeta.summary}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
