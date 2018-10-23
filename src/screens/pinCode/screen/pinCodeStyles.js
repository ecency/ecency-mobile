import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '$deviceHeight / 15',
  },
  logoView: {
    flex: 2,
  },
  titleView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#357ce6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  informationView: {
    flex: 1,
    alignItems: 'center',
  },
  animatedView: {
    flex: 1,
    alignItems: 'center',
  },
  numericKeyboardView: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  forgotButtonView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotButtonText: {
    color: '#788187',
    fontSize: 14,
    marginTop: 25,
    alignSelf: 'center',
    marginBottom: 25,
  },
});
