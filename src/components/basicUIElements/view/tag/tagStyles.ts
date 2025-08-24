import EStyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';

export default EStyleSheet.create({
  text: {
    color: '$pureWhite',
    fontSize: 10,
    fontWeight: 'bold',
  },
  isPin: {
    backgroundColor: '$primaryBlue',
  },
  isPostCardTag: {
    backgroundColor: '$tagColor',
  },
  textWrapper: {
    paddingHorizontal: Platform.OS === 'android' ? 16 : 8,
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: 8,
    height: 22,
    backgroundColor: '$iconColor',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  isFilter: {
    backgroundColor: 'transparent',
  },
  isFilterTextUnPin: {
    color: '$primaryDarkGray',
    fontSize: 12,
  },
  isFilterTextPin: {
    fontSize: 12,
  },
});
