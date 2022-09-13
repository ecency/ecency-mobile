import EStyleSheet from 'react-native-extended-stylesheet';
import isAndroidOreo from '../../../../utils/isAndroidOreo';

export default EStyleSheet.create({
  container: {
    // height: isAndroidOreo() ? 28 : 40,
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
    flex: 1,
    height: isAndroidOreo() ? 28 : 40,
  },
  warning: {
    color: '$primaryRed',
    fontSize: 12,
    fontFamily: '$editorFont',
  },
});
