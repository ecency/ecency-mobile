import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './profileSummaryPlaceHolderStyles';

const ProfileSummaryPlaceHolder = () => (
  <View style={styles.container}>
    <View style={styles.textWrapper}>
      <Placeholder.Paragraph lineNumber={1} />
    </View>
    <Placeholder.Box animate="fade" height={75} width="100%" radius={5} />
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

export default ProfileSummaryPlaceHolder;
