import { PixelRatio, Platform } from 'react-native';
import getWindowDimensions from './getWindowDimensions';

const { width: SCREEN_WIDTH } = getWindowDimensions();

// based on iphone X's scale
const scale = SCREEN_WIDTH / 414;

export default (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};
