import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';
import scalePx from '../../../utils/scalePx';

const deviceWidth = Dimensions.get('screen').width;

export default EStyleSheet.create({
  wrapper: {
    width: deviceWidth,
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    borderTopWidth: 0.1,
    shadowOpacity: 0.2,
    height: 50,
    elevation: 15,
  },
  subContent: {
    flexDirection: 'row',
    zIndex: 1,
    position: 'absolute',
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
