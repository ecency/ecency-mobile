import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';
import { useSelector } from 'react-redux';

import styles from './profileSummaryPlaceHolderStyles';
// TODO: make container for place holder wrapper after alpha
const ProfileSummaryPlaceHolder = () => {
  const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Placeholder.Paragraph lineNumber={1} color={color} />
      </View>
      <Placeholder.Box animate="fade" height={75} width="100%" radius={5} color={color} />
      <View style={styles.paragraphWrapper}>
        <Placeholder.Paragraph
          color={color}
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

};

export default ProfileSummaryPlaceHolder;
