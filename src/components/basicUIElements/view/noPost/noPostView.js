import React from 'react';
import { View, Text, Image } from 'react-native';
import NO_POST from '../../../../assets/no_post.png';
import styles from './noPostStyles';

const NoPost = ({
  text, name, defaultText, source, imageStyle, style,
}) => (
  <View style={[styles.wrapper, style]}>
    <Image style={[styles.image, imageStyle]} source={source || NO_POST} />
    {name ? (
      <Text style={styles.text}>{`@${name} ${text}`}</Text>
    ) : (
      <Text style={styles.text}>{defaultText}</Text>
    )}
  </View>
);

export default NoPost;
