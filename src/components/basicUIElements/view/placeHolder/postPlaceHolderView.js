import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { ThemeContainer } from '../../../../containers';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const PostPlaceHolder = () => {
  return (
    <ThemeContainer>
      {({ isDarkTheme }) => {
        const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

        return (
          <View>
            <LottieView
              style={{ width: getWindowDimensions().nativeWidth - 24 }}
              source={require('../../../../assets/animations/postBody.json')}
              autoPlay
              loop={true}
              autoSize={true}
              resizeMode="cover"
              colorFilters={[
                {
                  keypath: 'layer1',
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

export default PostPlaceHolder;
