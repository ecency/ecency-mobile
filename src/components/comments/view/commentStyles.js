import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  list: {
    marginBottom: 0,
  },
  moreRepliesButtonWrapper: {
    backgroundColor: '$iconColor',
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 15,
    minWidth: 40,
    maxWidth: 170,
  },
  moreRepliesText: {
    color: '$white',
    fontSize: 10,
  },
  emptyText: {
    color: '$primaryDarkGray',
    fontSize: 16,
    justifyContent: 'center',
    marginTop: 5,
    padding: 32,
  },
});
