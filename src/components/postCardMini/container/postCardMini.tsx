import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../styles/postCardMini.styles';



export const PostCardMini = ({ thumbnailUrl, title, body }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
      <View style={styles.textContainer}>
        <Text style={styles.hivePost}>HIVE POST</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.body} numberOfLines={1}>{body}</Text>
      </View>
    </View>
  );
};

