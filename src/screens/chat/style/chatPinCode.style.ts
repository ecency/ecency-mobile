import EStyleSheet from 'react-native-extended-stylesheet';
import { ViewStyle } from 'react-native';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  } as ViewStyle,
  input: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '$primaryDarkText',
    width: 36,
    height: 36,
  } as ViewStyle,
  inputFocus: {
    borderWidth: 1,
    borderColor: '$primaryBlack',
  } as ViewStyle,
  failText: {
    fontSize: 16,
    color: 'red',
  },
});
