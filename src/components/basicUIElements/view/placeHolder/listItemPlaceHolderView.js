import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './listItemPlaceHolderStyles';
// TODO: make container for place holder wrapper after alpha
const ListItemPlaceHolderView = ({ isDarkTheme }) => {
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

  return (
    <View style={styles.container}>
      <Placeholder.Media size={40} hasRadius animate="fade" color={color} />
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

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(ListItemPlaceHolderView);
