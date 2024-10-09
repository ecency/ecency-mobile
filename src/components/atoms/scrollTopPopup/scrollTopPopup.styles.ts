import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  popupContainer: {
    position: 'absolute',
    bottom: 24,
    right: 0,
    alignItems: 'center',
  },
  popupContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryBlue',
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
  } as ViewStyle,
  arrowUpIcon: {
    color: '$primaryGray',
    margin: 0,
    marginHorizontal: 4,
  },
});
