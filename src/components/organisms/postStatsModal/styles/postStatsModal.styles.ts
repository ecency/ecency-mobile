import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  modalStyle: {
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    marginHorizontal: 24,
  },

  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
  },

  container: {
    alignItems: 'center',
    marginHorizontal: 16,
  } as ViewStyle,

  button: {
    marginTop: 16,
    backgroundColor: '$primaryBlue',
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  promoteText: {
    marginTop: 32,
    marginHorizontal: 24,
    color: '$primaryBlack',
    fontWeight: '700',
  } as TextStyle,

  promoteSubText: {
    color: '$iconColor',
    fontWeight: '500',
  } as TextStyle,
});
