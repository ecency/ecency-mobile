import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import { useSelector } from 'react-redux';

import styles from './listItemPlaceHolderStyles';

const ListItemPlaceHolderView = () => {

  const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';
  return (
    <View style={styles.container}>
      <Placeholder.Media size={30} hasRadius animate="fade" color={color} />
      <View style={styles.paragraphWrapper}>
        <Placeholder.Paragraph
          color={color}
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
  );

};

export default ListItemPlaceHolderView;
