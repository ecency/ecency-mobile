import EStyleSheet from 'react-native-extended-stylesheet';
import scalePx from '../../../utils/scalePx';

export default EStyleSheet.create({
  badge: {
    color: '$primaryLightGray',
    alignItems: 'center',
    fontSize: scalePx(12),
    fontWeight: '600',
  },
  badgeWrapper: {
    position: 'absolute',
    left: scalePx(15),
    top: scalePx(18),
    backgroundColor: '$primaryRed',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    height: scalePx(17),
    minWidth: scalePx(17),
    borderRadius: scalePx(15),
  },
});
