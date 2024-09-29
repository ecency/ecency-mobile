import EStyleSheet from 'react-native-extended-stylesheet';
import scalePx from '../../../utils/scalePx';

export default EStyleSheet.create({
  badge: {
    color: '$primaryLightGray',
    alignItems: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeWrapper: {
    position: 'absolute',
    left: 15,
    top: 18,
    backgroundColor: '$primaryRed',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    height: 17,
    minWidth: 17,
    borderRadius: 15,
  },
});
