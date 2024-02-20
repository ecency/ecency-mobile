import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';

import getWindowDimensions from '../../../../utils/getWindowDimensions';

const PostPlaceHolder = () => {
  const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

  return (
    <View>
      <LottieView
        style={{ width: getWindowDimensions().nativeWidth - 24, flex:1 }}
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
};

export default PostPlaceHolder;
