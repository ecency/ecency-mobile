import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';
import scalePx from '../../../utils/scalePx';

const deviceWidth = Dimensions.get('window').width;

export default EStyleSheet.create({
  wrapper: {
    width: deviceWidth,
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 999,
  },
  subContent: {
    flexDirection: 'row',
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    marginHorizontal: scalePx(20),
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    zIndex: 0,
    paddingVertical: scalePx(10),
    paddingHorizontal: scalePx(10),
    width: (deviceWidth - scalePx(38)) / 5,
  },
  circle: {
    bottom: scalePx(25),
  },
});
