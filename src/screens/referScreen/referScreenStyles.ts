import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  pointsEarnedContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  points: {
    color: '$primaryBlue',
    fontSize: 26,
    marginTop: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  earendText: {
    color: '$darkIconColor',
    fontSize: 18,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 5,
  },
  mainButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  mainButtonWrapper: {
    flexDirection: 'row',
  },
  unclaimedText: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  mainIconWrapper: {
    backgroundColor: '$pureWhite',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 20,
    width: 24,
    height: 24,
  },
  referralsListContainer:{
    flex:1,
  }
});
