import React from 'react';
import { View, Dimensions } from 'react-native';
import Placeholder from 'rn-placeholder';

import { ThemeContainer } from '../../../../containers';
import LottieView from 'lottie-react-native';

import styles from './postCardPlaceHolderStyles';
// TODO: make container for place holder wrapper after alpha
const PostCardPlaceHolder = () => {
  
  const animationStyle = {
    width:Dimensions.get('screen').width - 32
  }


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
            resizeMode='cover'
            colorFilters={[
              {
                keypath:'postList',
                color:color
              }
            ]
            }
          />

            {/* <View style={styles.textWrapper}>
              <Placeholder.Media size={35} hasRadius animate="fade" color={color} />
              <Placeholder.Line width="30%" lastLineWidth="30%" animate="fade" color={color} />
            </View>
            <Placeholder.Box animate="fade" height={200} width="100%" radius={5} color={color} />
            <View style={styles.paragraphWrapper}>
              <Placeholder.Paragraph
                lineNumber={3}
                color={color}
                textSize={16}
                lineSpacing={5}
                width="100%"
                lastLineWidth="70%"
                firstLineWidth="50%"
                animate="fade"
              />
            </View> */}
          </View>
        );
      }}
    </ThemeContainer>
  );
};
export default PostCardPlaceHolder;