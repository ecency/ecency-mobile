import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const styles = EStyleSheet.create({
  modal: {
    width: '$deviceWidth - 56',
    backgroundColor: '$primaryBackgroundColor',
    borderRadius: 12,
    padding: 16,
    paddingBottom: 0,
  },
  textInput: {
    fontSize: 16,
    color: '$primaryDarkText',
    minHeight: 120,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 6,
    padding: 8,
  } as TextStyle,
  button: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    alignSelf: 'flex-end',
  } as ViewStyle,
  buttonText: {
    color: '$primaryBlack',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default styles;
