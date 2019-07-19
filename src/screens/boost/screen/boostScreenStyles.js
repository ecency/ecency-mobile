import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'absolute',
    top: '$deviceHeight / 3',
  },
  boostLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginVertical: 12,
    alignSelf: 'center',
    paddingHorizontal: 18,
    minWidth: '$deviceWidth / 2.4',
  },
  buttonContent: {
    flexDirection: 'row',
  },
  buttonText: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    width: 100,
  },
  buttonIconWrapper: {
    backgroundColor: '$pureWhite',
    borderRadius: 20,
    width: 24,
    height: 24,
  },
  priceWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  descriptionWrapper: {
    backgroundColor: '#c10000',
    width: '$deviceWidth / 3',
  },
});
