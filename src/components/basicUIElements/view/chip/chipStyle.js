import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: '$primaryBackgroundColor',
    backgroundColor: '#c1c5c7',
    borderRadius: 50,
    height: 25,
    padding: 5,
    paddingHorizontal: 10,
    minWidth: 50,
    marginRight: 8,
  },
  textInput: {
    fontFamily: '$editorFont',
    fontSize: 10,
    color: '$primaryLightGray',
    paddingVertical: 0,
  },
  isPin: {
    backgroundColor: '$primaryBlue',
  },
  removeIcon: {
    marginLeft: 5,
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    position: 'absolute',
    right: 2,
  },
  iconStyle: {
    color: '$primaryLightGray',
  },
  textInputWithButton: {
    marginRight: 15,
  },
});
