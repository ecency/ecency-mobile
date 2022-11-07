import React from 'react';
import { View } from 'react-native';

import LottieView from 'lottie-react-native';
import { ThemeContainer } from '../../../../containers';

import styles from './listItemPlaceHolderStyles';

const CommentPlaceHolderView = () => {
  const animationStyle = {
    width: 300,
    height: 72,
  };

  return (
    <ThemeContainer>
      {({ isDarkTheme }) => {
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
      }}
    </ThemeContainer>
  );
};

export default CommentPlaceHolderView;
