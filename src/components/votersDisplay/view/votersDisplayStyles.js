import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    marginBottom: 40,
    flexDirection: 'row',
    height: '$deviceHeight - 150',
    backgroundColor: '$primaryBackgroundColor',
  },
  text: {
    color: '$iconColor',
    fontSize: 12,
    fontFamily: '$primaryFont',
  },
  emptyContainer: {
    justifyContent: 'flex-start',
    marginTop: 72,
  },
});
