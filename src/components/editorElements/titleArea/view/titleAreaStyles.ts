import EStyleSheet from 'react-native-extended-stylesheet';
import isAndroidOreo from '../../../../utils/isAndroidOreo';

export default EStyleSheet.create({
  textInput: {
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontSize: isAndroidOreo() ? 16 : 24,
    fontFamily: '$editorFont',
    textAlignVertical: 'top',
    paddingVertical: 0,
    backgroundColor: '$primaryBackgroundColor',
  },
});
