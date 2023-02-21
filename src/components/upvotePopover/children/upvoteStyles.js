import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
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
  popoverSlider: {
    flexDirection: 'row',
    width: '$deviceWidth - 20',
    height: 48,
    borderRadius: '$deviceWidth - 20 / 2',
    paddingHorizontal: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  popoverDetails: {
    flexDirection: 'row',
    height: 'auto',
    borderRadius: 20,
    paddingHorizontal: 26,
    backgroundColor: '$primaryBackgroundColor',
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: '$primaryLightBackground',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
    elevation: 3,
  },
  amount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '$primaryDarkGray',
    marginLeft: 8,
  },
  percent: {
    fontWeight: 'bold',
    color: '$primaryDarkGray',
    marginRight: 5,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  popoverWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    borderTopColor: '$primaryBackgroundColor',
    marginLeft: 25,
  },
  payoutTextButton: {
    alignSelf: 'center',
  },
  hideArrow: {
    borderTopColor: 'transparent',
  },
  overlay: {},
  payoutValue: {
    alignSelf: 'center',
    fontSize: 10,
    color: '$primaryDarkGray',
    marginLeft: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  declinedPayout: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  detailsText: {
    color: '$primaryDarkGray',
    fontSize: 12,
    textAlign: 'right',
  },
  popoverItemContent: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'space-between',
  },
  popoverContent: {
    marginTop: 4,
    marginBottom: 8,
  },
  detailsLabel: {
    width: 120,
    color: '$primaryDarkGray',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
