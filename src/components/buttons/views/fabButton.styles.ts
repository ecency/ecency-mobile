import EStyleSheet from 'react-native-extended-stylesheet';
import roundPx from '../../../utils/roundPx';

export default EStyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    right: roundPx(16),
    // bottom is overridden from component via { bottom: bottomOffset }
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

