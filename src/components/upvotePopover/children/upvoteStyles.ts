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
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  popoverDetails: {
    flexDirection: 'row',
    height: 'auto',
    borderRadius: 20,
    paddingHorizontal: 26,
    paddingVertical: 8,
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
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  // Custom drag-anywhere vote slider (replaces native Slider)
  voteSliderRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  voteSliderTrack: {
    flex: 1,
    height: 28,
    borderRadius: 14,
    backgroundColor: '$primaryLightBackground',
    justifyContent: 'center',
  },
  voteSliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 14,
  },
  voteSliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    backgroundColor: '$pureWhite',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.3,
    elevation: 3,
  },
  // Tappable NN% label (opens the keyboard-free keypad)
  percentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  percentEditIcon: {
    color: '$primaryDarkGray',
    marginLeft: 3,
  },
  // Keyboard-free numeric keypad (percentKeypad.tsx) shown while editing
  popoverKeypad: {
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '$primaryBackgroundColor',
  },
  keypadWrapper: {
    flex: 1,
    paddingVertical: 2,
  },
  keypadHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  keypadValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  keypadAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '$primaryDarkGray',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadKey: {
    flex: 1,
    height: 40,
    marginHorizontal: 4,
    marginVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
  },
  keypadKeyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '$primaryBlack',
  },
  keypadIcon: {
    color: '$primaryBlack',
  },
  keypadDoneKey: {},
  keypadDoneIcon: {
    color: '$pureWhite',
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
