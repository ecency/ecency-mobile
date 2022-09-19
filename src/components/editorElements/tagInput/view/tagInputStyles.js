import EStyleSheet from 'react-native-extended-stylesheet';
import isAndroidOreo from '../../../../utils/isAndroidOreo';

export default EStyleSheet.create({
  container: {

  },
  textInput: {
    color: '$primaryBlack',
    fontSize: 15,
    fontFamily: '$editorFont',
    backgroundColor: '$primaryBackgroundColor',
    borderTopWidth: 1,
    borderTopColor: '$primaryLightGray',
    borderBottomWidth: 1,
    borderBottomColor: '$primaryLightGray',
    height: isAndroidOreo() ? 36: 40
  },
  warning: {
    color: '$primaryRed',
    fontSize: 12,
    fontFamily: '$editorFont',
  },
});
