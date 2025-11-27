import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  popupContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    alignItems: 'center',
  },
  popupContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryBlue',
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
  } as ViewStyle,
  arrowUpIcon: {
    color: '$primaryGray',
    margin: 0,
    marginHorizontal: 4,
  },
});
