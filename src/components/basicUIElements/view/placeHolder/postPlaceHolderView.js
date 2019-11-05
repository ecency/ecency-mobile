import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import { ThemeContainer } from '../../../../containers';

import styles from './postCardPlaceHolderStyles';

const PostPlaceHolder = () => {
  return (
    <ThemeContainer>
      {({ isDarkTheme }) => {
        const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

        return (
          <View>
            <View style={styles.paragraphWrapper}>
              <Placeholder.Paragraph
                color={color}
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
            <Placeholder.Box animate="fade" height={200} width="100%" radius={5} color={color} />
            <View style={styles.paragraphWrapper}>
              <Placeholder.Paragraph
                color={color}
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
      }}
    </ThemeContainer>
  );
};

export default PostPlaceHolder;
