import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import { ThemeContainer } from '../../../../containers';

import styles from './listItemPlaceHolderStyles';

const ListItemPlaceHolderView = () => {
  return (
    <ThemeContainer>
      {({ isDarkTheme }) => (
        <View style={styles.container}>
          <Placeholder.Media
            size={30}
            hasRadius
            animate="fade"
            color={isDarkTheme ? '#2e3d51' : '#f5f5f5'}
          />
          <View style={styles.paragraphWrapper}>
            <Placeholder.Paragraph
              color={isDarkTheme ? '#2e3d51' : '#f5f5f5'}
              lineNumber={2}
              textSize={12}
              lineSpacing={8}
              width="100%"
              lastLineWidth="70%"
              firstLineWidth="50%"
              animate="fade"
            />
          </View>
        </View>
      )}
    </ThemeContainer>
  );
};

export default ListItemPlaceHolderView;
