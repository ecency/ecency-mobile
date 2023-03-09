import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvoteIcon: {
    alignSelf: 'center',
    fontSize: 24,
    color: '$primaryBlue',
    marginRight: 5,
  },
  payoutTextButton: {
    alignSelf: 'center',
  },
  payoutValue: {
    alignSelf: 'center',
    fontSize: 10,
    color: '$primaryDarkGray',
    marginLeft: 8,
  },
  declinedPayout: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  boldText: {
    fontWeight: 'bold',
  },
});
