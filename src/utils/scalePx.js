import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// based on iphone X's scale
const scale = SCREEN_WIDTH / 414;

export default size => {
  const newSize = size * scale;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
