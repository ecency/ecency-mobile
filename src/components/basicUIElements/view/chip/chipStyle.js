import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  textInput: {
    color: '$primaryBackgroundColor',
    fontSize: 10,
    backgroundColor: '#c1c5c7',
    borderRadius: 50,
    height: 20,
    padding: 5,
    paddingHorizontal: 10,
    minWidth: 50,
    marginRight: 8,
    fontFamily: '$editorFont',
  },
  isPin: {
    backgroundColor: '$primaryBlue',
  },
});
