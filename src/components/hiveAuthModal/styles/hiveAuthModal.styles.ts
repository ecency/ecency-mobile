import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
  },
  indicator: {
    backgroundColor: '$iconColor',
  },
  container: {
    height: 300,
  } as ViewStyle,
  content: {
    flex: 1,
    paddingHorizontal: 32,
    marginTop: -40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    color: '$primaryDarkText',
    // flexGrow: 1,
  },
  resultIcon: {
    marginBottom: 24,
  },
  inputWrapper: {
    borderRadius: 28,
    borderTopEndRadius: 28,
    borderTopStartRadius: 28,
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingRight:8,
    height: 56,
  } as ViewStyle,
});
