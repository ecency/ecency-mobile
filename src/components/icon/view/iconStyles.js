import EStyleSheet from 'react-native-extended-stylesheet';
import scalePx from '../../../utils/scalePx';

export default EStyleSheet.create({
  badge: {
    color: '$primaryLightGray',
    alignItems: 'center',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeWrapper: {
    position: 'absolute',
    right: scalePx(15),
    top: scalePx(18),
    backgroundColor: '$primaryRed',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    height: scalePx(20),
    minWidth: scalePx(20),
    borderRadius: scalePx(10),
  },
});
