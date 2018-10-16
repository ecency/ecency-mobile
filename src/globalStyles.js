import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  containerHorizontal16: {
    flex: 1,
    paddingHorizontal: 16,
  },
  defaultContainer: {
    flex: 1,
  },
  title: {},
  text: {
    fontFamily: '$primaryFont',
    letterSpacing: '$primaryLatterSpacing',
  },
  subTitle: {
    fontFamily: '$primaryFont',
    letterSpacing: '$primaryLatterSpacing',
  },
  subText: {
    fontFamily: '$primaryFont',
    letterSpacing: '$primaryLatterSpacing',
  },
  shadow: {
    shadowOpacity: 0.8,
    shadowColor: '$shadowColor',
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },
  errorText: {
    fontFamily: '$primaryFont',
    letterSpacing: '$primaryLatterSpacing',
    width: '$deviceWidth / 1.4',
    fontSize: 10,
    padding: 5,
    height: 50,
    flex: 1,
    color: '#ff1954',
    paddingTop: 10,
    textAlign: 'center',
  },
  label: {
    fontFamily: '$primaryFont',
    letterSpacing: '$primaryLatterSpacing',
    fontSize: 12,
  },
});
