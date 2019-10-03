import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 72,
    fontWeight: '700',
    color: '$primaryDarkGray',
  },
  countDesc: {
    color: '$primaryDarkGray',
    fontSize: 16,
    fontWeight: '700',
  },
  spinnerWrapper: {
    flex: 1,
    marginTop: 10,
  },
  backgroundTags: {
    position: 'absolute',
    width: '$deviceWidth',
    height: 320,
    left: -120,
    top: -8,
    right: 0,
    zIndex: 999,
  },
  buttonContent: {
    flexDirection: 'row',
  },
  buttonWrapper: {
    minWidth: '$deviceWidth / 2.4',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  buttonText: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    minWidth: 70,
    textAlign: 'center',
  },
  buttonIconWrapper: {
    backgroundColor: '$pureWhite',
    borderRadius: 20,
    width: 24,
    height: 24,
  },
  button: {
    marginVertical: 12,
    paddingHorizontal: 18,
    marginTop: 50,
  },

  descriptionWrapper: {
    backgroundColor: '$primaryDarkBlue',
    width: 75,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    position: 'absolute',
    top: '$deviceHeight / 6',
    left: '$deviceWidth / 1.87',
  },
  description: {
    fontSize: 10,
    color: '$pureWhite',
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '$primaryDarkBlue',
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    left: -22,
  },
});
