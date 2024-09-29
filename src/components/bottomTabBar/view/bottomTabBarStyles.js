import EStyleSheet from 'react-native-extended-stylesheet';
import scalePx from '../../../utils/scalePx';
import getWindowDimensions from '../../../utils/getWindowDimensions';

const deviceWidth = getWindowDimensions().width;

export default EStyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    borderTopWidth: 0.1,
    shadowOpacity: 0.2,
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
