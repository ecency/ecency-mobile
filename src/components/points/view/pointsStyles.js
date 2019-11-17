import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  pointText: {
    color: '$primaryBlue',
    fontSize: 26,
    marginTop: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  pointsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    flex: 1,
  },
  dropdownRowText: {
    fontSize: 14,
    color: '$primaryDarkGray',
    textAlign: 'center',
  },
  dropdownRowStyle: {
    marginLeft: 0,
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
    fontSize: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 5,
  },
  icon: {
    fontSize: 24,
    color: '$primaryDarkText',
  },
  mainButton: {
    marginVertical: 8,
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
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  scrollContentContainer: {
    paddingBottom: 60,
  },
});
