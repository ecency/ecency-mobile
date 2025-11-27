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
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
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
  fabWrapper: {
    position: 'absolute',
    right: roundPx(16),
    // bottom is overridden from component via { bottom: _fabOffset }
    zIndex: 20,
    elevation: 20,
  },

  fabButton: {
    width: roundPx(56),
    height: roundPx(56),
    borderRadius: roundPx(28),
    backgroundColor: '$primaryBlue',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
