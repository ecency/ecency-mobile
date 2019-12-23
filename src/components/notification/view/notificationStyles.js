import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryBackgroundColor',
    flex: 1,
  },
  flatlistFooter: {
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    borderColor: '$borderColor',
  },
  loading: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 60,
  },
  text: {
    padding: 10,
  },
});
