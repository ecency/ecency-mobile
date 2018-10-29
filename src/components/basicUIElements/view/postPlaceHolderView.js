import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './postCardPlaceHolderStyles';

const PostPlaceHolder = () => (
  <View>
    <View style={styles.paragraphWrapper}>
      <Placeholder.Paragraph
        lineNumber={2}
        textSize={16}
        lineSpacing={5}
        width="100%"
        lastLineWidth="70%"
        firstLineWidth="50%"
        animate="fade"
      />
    </View>
    <View style={styles.paragraphWrapper} />
    <Placeholder.Box animate="fade" height={200} width="100%" radius={5} />
    <View style={styles.paragraphWrapper}>
      <Placeholder.Paragraph
        lineNumber={18}
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

export default PostPlaceHolder;
