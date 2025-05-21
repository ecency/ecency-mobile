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
  reblogWrapper: {
    marginLeft: 6,
  },
  repostText: {
    fontWeight: 'bold',
    color: '$primaryDarkGray',
    fontSize: 11,
    marginLeft: 2,
  },
  bodyHeader: {
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    marginTop: 4,
    marginHorizontal: 12,
    marginBottom: 12,
    marginRight: 0,
  },
  headerIconsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8,
    paddingBottom: 5,
  },
  pushPinIcon: {
    color: '$primaryRed',
    marginLeft: 8,
    transform: [{ rotate: '45deg' }],
  },
  pollPostIcon: {
    color: '$iconColor',
    marginLeft: 8,
  },
  dropdownWrapper: {
    marginTop: 6,
  },
  optionsIconContainer: {
    marginLeft: 12,
  },
  optionsIcon: {
    color: '$iconColor',
  },
  crossPostWrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
