import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 0.2,
    backgroundColor: '$primaryBackgroundColor',
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
  },
});
