import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  containerHorizontal16: {
    paddingHorizontal: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  defaultContainer: {
    flex: 1,
  },
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
    elevation: 3,
  },
  errorText: {
    fontFamily: '$primaryFont',
    letterSpacing: '$primaryLatterSpacing',
    width: '$deviceWidth / 1.4',
    fontSize: 10,
    padding: 5,
    height: 50,
    flex: 1,
    color: '$primaryRed',
    paddingTop: 10,
    textAlign: 'center',
  },
  label: {
    fontFamily: '$primaryFont',
    letterSpacing: '$primaryLatterSpacing',
    fontSize: 12,
  },
  container: {
    backgroundColor: '$primaryBackgroundColor',
    height: '$deviceHeight',
  },
  lightContainer: {
    backgroundColor: '$primaryLightBackground',
    flex: 1,
  },
  hintText: {
    color: '$iconColor',
    alignSelf: 'center',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: '$primaryBackgroundColor',
  },
});
