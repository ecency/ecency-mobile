import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  list: {
    marginBottom: 20,
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
});
