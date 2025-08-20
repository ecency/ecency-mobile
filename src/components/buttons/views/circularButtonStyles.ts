import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  button: {
    width: '$deviceWidth / 7',
    height: '$deviceWidth / 7',
    borderRadius: '$deviceWidth / 14',
    borderColor: '#357ce6',
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#357ce6',
    fontSize: 24,
    fontWeight: '500',
  },
});
