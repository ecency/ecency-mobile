import React from 'react';
import { View } from 'react-native';

import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import styles from './listItemPlaceHolderStyles';

const CommentPlaceHolderView = () => {
  const animationStyle = {
    width: 300,
    height: 72,
  };

  const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

  return (
    <View style={styles.container}>
      <LottieView
        style={animationStyle}
        source={require('../../../../assets/animations/commentBody.json')}
        autoPlay
        loop={true}
        autoSize={true}
        resizeMode="cover"
        colorFilters={[
          {
            keypath: 'comments',
            color,
          },
        ]}
      />
    </View>
  );
};

export default CommentPlaceHolderView;
