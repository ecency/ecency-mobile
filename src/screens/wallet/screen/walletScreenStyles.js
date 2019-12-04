import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

const HEADER_EXPANDED_HEIGHT = 260;

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

export default EStyleSheet.create({
  scrollContainer: {
    padding: 0,
    paddingTop: HEADER_EXPANDED_HEIGHT,
  },
  header: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    backgroundColor: '$primaryBackgroundColor',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
});
