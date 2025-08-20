import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    width: 54,
    backgroundColor: 'transparent',
    height: 19,
  },
  buttonText: {
    color: '$iconColor',
    fontSize: 16,
  },
});
