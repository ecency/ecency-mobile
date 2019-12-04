import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

const HEADER_EXPANDED_HEIGHT = 260;
const HEADER_COLLAPSED_HEIGHT = 20;

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaea',
  },
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
  title: {
    marginVertical: 16,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 24,
  },
});
