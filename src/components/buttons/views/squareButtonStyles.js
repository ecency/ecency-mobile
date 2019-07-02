import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  button: {
    borderColor: '$primaryBlue',
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '$primaryBlue',
    fontSize: 24,
    fontWeight: '500',
  },
});
