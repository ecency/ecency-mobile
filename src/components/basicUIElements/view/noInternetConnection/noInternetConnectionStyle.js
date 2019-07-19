import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  grayBackground: {
    backgroundColor: '$noConnectionColor',
  },
  container: {
    alignItems: 'center',
    height: 45,
    backgroundColor: '$noConnectionColor',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
  },
  icon: {
    color: '$pureWhite',
    marginRight: 5,
  },
});
