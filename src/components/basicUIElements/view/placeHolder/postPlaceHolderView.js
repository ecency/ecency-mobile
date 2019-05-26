import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './postCardPlaceHolderStyles';
// TODO: make container for place holder wrapper after alpha
const PostPlaceHolder = ({ isDarkTheme }) => {
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
};

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(PostPlaceHolder);
