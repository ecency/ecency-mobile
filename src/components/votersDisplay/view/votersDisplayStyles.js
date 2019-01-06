import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'row',
    height: '$deviceHeight - 100',
    backgroundColor: '$primaryBackgroundColor',
  },
  text: {
    color: '$iconColor',
    fontSize: 12,
    fontFamily: '$primaryFont',
  },
});
