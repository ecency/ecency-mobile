import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  avatar: {
    borderWidth: 1,
    borderColor: '$borderColor',
    backgroundColor: '$pureWhite',
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    bottom: 0,
  },
});
