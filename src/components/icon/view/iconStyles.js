import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  notification: {
    backgroundColor: '$primaryRed',
    color: '$primaryBackgroundColor',
    textAlign: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '$primaryBackgroundColor',
    alignSelf: 'center',
    paddingHorizontal: 4,
    fontSize: 10,
    position: 'absolute',
    right: -5,
    top: -7,
  },
});
