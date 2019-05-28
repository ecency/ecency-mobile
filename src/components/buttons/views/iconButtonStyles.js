import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  circleButton: {
    alignItems: 'center',
    backgroundColor: '$primaryBackgroundColor',
    height: 60,
    width: 60,
    borderRadius: 60 / 2,
    justifyContent: 'center',
    borderColor: '$primaryBlue',
    borderWidth: 1,
  },
  buttonStyle: {
    padding: 10,
  },
});
