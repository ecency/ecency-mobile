import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  } as ViewStyle,
});
