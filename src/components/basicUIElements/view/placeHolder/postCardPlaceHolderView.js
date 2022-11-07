import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { ThemeContainer } from '../../../../containers';
import styles from './postCardPlaceHolderStyles';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const PostCardPlaceHolder = () => {
  const animationStyle = {
    width: getWindowDimensions().nativeWidth - 32,
  };

  return (
    <ThemeContainer>
      {({ isDarkTheme }) => {
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
      }}
    </ThemeContainer>
  );
};
export default PostCardPlaceHolder;
