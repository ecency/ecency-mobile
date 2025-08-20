import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '$primaryBackgroundColor',
  },
  text: {
    color: '$iconColor',
    fontSize: 12,
    marginLeft: 20,
    fontFamily: '$primaryFont',
  },
});
