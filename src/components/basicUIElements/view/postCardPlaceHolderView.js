import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './postCardPlaceHolderStyles';

const PostCardPlaceHolder = () => (
  <View style={styles.container}>
    <View style={styles.textWrapper}>
      <Placeholder.Media size={25} hasRadius animate="fade" />
      <Placeholder.Line width="30%" lastLineWidth="30%" animate="fade" />
    </View>
    <Placeholder.Box animate="fade" height={200} width="100%" radius={5} />
    <View style={styles.paragraphWrapper}>
      <Placeholder.Paragraph
        lineNumber={3}
        textSize={16}
        lineSpacing={5}
        width="100%"
        lastLineWidth="70%"
        firstLineWidth="50%"
        animate="fade"
      />
    </View>
  </View>
);

export default PostCardPlaceHolder;
