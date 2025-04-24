import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/postCardMini.styles';
import { useGetPostQuery } from '../../../providers/queries/postQueries/postQueries';
import Placeholder from 'rn-placeholder';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Image as ExpoImage } from 'expo-image';


interface PostCardMiniProps {
  author: string;
  permlink: string;
  contentWidth: number;
  onPress: () => void;
}

export const PostCardMini = ({ author, permlink, contentWidth, onPress }: PostCardMiniProps) => {

  const _containerStyle = { ...styles.container, width: contentWidth }

  const getPostQuery = useGetPostQuery({ author, permlink });

  const _renderPlaceholder = <Placeholder.Box color={EStyleSheet.value('$primaryLightBackground')} animate="fade" height={12} width={contentWidth - 92} />

  return (
    <TouchableOpacity onPress={onPress} style={_containerStyle}>
      <ExpoImage source={{ uri: getPostQuery.data?.image }} style={styles.thumbnail} />
      <View style={styles.textContainer}>
        <Text style={styles.hivePost}>HIVE POST</Text>
        {getPostQuery.isLoading
          ? _renderPlaceholder : <Text style={styles.title} numberOfLines={1}>{getPostQuery.data.title}</Text>}
        {getPostQuery.isLoading
          ? _renderPlaceholder : <Text style={styles.body} numberOfLines={1}>{getPostQuery.data.summary}</Text>}
      </View>
    </TouchableOpacity>
  );
};

