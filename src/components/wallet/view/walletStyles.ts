import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  // First collabsible component
  mainButton: {
    marginBottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  // TODO: merge them / ugur
  unclaimedText: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  unclaimedTextPreview: {
    color: '$primaryBlue',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 18,
    height: 30,
  },
  mainButtonWrapper: {
    flexDirection: 'row',
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
  scrollView: {
    backgroundColor: '$primaryLightBackground',
  },
  scrollContentContainer: {
    paddingBottom: 60,
  },
});
