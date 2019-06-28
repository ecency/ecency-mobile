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
  priceText: {
    color: '$editorButtonColor',
    fontSize: 22,
    marginTop: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  placeTitleText: {
    color: '$primaryBlue',
    paddingTop: 5,
    fontSize: 15,
    textAlign: 'center',
  },
  placeIcon: {
    width: 30,
    height: 30,
  },
  activeIconWrapper: {
    backgroundColor: '$white',
  },
  slide: {
    borderRadius: 6,
    flex: 1,
    shadowOpacity: 0.5,
    shadowColor: '$shadowColor',
    paddingBottom: 5,
    shadowOffset: {
      height: 3,
    },
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '$deviceWidth / 2',
    height: '$deviceHeight / 7',
    padding: '5%',
  },
  slider: {
    height: '$deviceHeight / 6',
  },
});
