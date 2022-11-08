import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import isAndroidOreo from '../../../../utils/isAndroidOreo';

export default EStyleSheet.create({
  container: {
    marginTop: 8,
    backgroundColor: '$primaryBackgroundColor',
    borderTopWidth: EStyleSheet.hairlineWidth,
    borderTopColor: '$primaryDarkGray',
    borderBottomWidth: EStyleSheet.hairlineWidth,
    borderBottomColor: '$primaryDarkGray',
  },
  tagContainer: {
    marginLeft: 0,
    marginRight: 12,
    backgroundColor: '$primaryLightBackground',
  } as ViewStyle,
  tagText: {
    color: '$primaryDarkText',
  } as TextStyle,
  textInput: {
    color: '$primaryDarkText',
    fontSize: 15,
    fontFamily: '$editorFont',
    height: isAndroidOreo() ? 36 : 40,
    minWidth: 250,
  } as TextStyle,
  warning: {
    color: '$primaryRed',
    fontSize: 12,
    fontFamily: '$editorFont',
  },
});
