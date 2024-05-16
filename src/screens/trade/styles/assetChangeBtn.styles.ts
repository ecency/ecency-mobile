import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  changeBtnContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  changeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 28,
    borderWidth: 8,
    borderColor: '$primaryBackgroundColor',
  } as ViewStyle,
  changeBtnSize: {
    height: 60,
    width: 60,
  } as ViewStyle,
});
