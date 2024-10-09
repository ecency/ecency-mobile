import EStyleSheet from 'react-native-extended-stylesheet';
import roundPx from '../../../utils/roundPx';
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
    marginHorizontal: roundPx(20),
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    zIndex: 0,
    paddingVertical: roundPx(10),
    paddingHorizontal: roundPx(10),
    width: (deviceWidth - roundPx(38)) / 5,
  },
  circle: {
    bottom: roundPx(25),
  },
});
