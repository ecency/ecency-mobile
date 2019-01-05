import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'row',
    height: '$deviceHeight - 100',
    backgroundColor: '$primaryBackgroundColor',
  },
  title: {
    color: '$iconColor',
    fontSize: 14,
    fontFamily: '$primaryFont',
    fontWeight: 'bold',
    marginLeft: 16,
  },
});
