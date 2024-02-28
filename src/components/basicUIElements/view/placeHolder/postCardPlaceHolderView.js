import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import styles from './postCardPlaceHolderStyles';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const PostCardPlaceHolder = () => {
  const _width = getWindowDimensions().width - 32;

  const animationStyle = {
    width: _width,
    height: _width * 2
  };

  const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';
  return (
    <View style={styles.container}>
      <LottieView
        style={animationStyle}
        source={require('../../../../assets/animations/postList.json')}
        autoPlay
        loop={true}
        autoSize={true}
        resizeMode="cover"
        colorFilters={[
          {
            keypath: 'postList',
            color,
          },
        ]}
      />
    </View>
  );
};
export default PostCardPlaceHolder;
