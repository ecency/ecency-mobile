import React from 'react';
import { View } from 'react-native';

import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../../../../redux/selectors';
import styles from './listItemPlaceHolderStyles';

const CommentPlaceHolderView = () => {
  const _width = 300;

  const animationStyle = {
    width: _width,
    height: _width / 2.8,
  };

  const isDarkTheme = useSelector(selectIsDarkTheme);
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
