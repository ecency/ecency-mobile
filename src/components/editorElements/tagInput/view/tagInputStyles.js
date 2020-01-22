import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    height: 60,
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
  },
  warning: {
    color: '$primaryRed',
    fontSize: 12,
    fontFamily: '$editorFont',
  },
});
