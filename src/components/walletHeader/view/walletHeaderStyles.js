import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  balanceText: {
    color: '$primaryBlue',
    fontSize: 26,
    marginTop: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  balanceWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  dropdownButtonStyle: {
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    right: -40,
    top: 20,
  },
  subText: {
    color: '$darkIconColor',
    fontSize: 18,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 5,
  },
  icon: {
    fontSize: 24,
    color: '$primaryDarkText',
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
  scrollContainer: {
    flex: 0.935,
    width: '100%',
    backgroundColor: '$primaryBackgroundColor',
  },
  scrollContentContainer: {
    paddingBottom: 60,
  },
  valueDescriptions: {
    marginLeft: -30,
    marginTop: 20,
    marginBottom: -10,
  },
});
