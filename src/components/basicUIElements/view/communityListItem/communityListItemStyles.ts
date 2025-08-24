import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'column',
    marginLeft: 8,
    width: '100%',
  },
  itemWrapper: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
  },
  itemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  title: {
    color: '$primaryBlue',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: '$primaryFont',
  },
  about: {
    fontSize: 14,
    fontFamily: '$primaryFont',
    marginTop: 5,
    paddingTop: 10,
    color: '$primaryBlack',
  },
  separator: {
    width: 100,
    alignSelf: 'center',
    backgroundColor: '$primaryDarkGray',
    height: 1,
    marginVertical: 10,
  },
  stats: {
    fontSize: 14,
    fontFamily: '$primaryFont',
    color: '$primaryDarkGray',
    paddingBottom: 10,
  },
  subscribeButton: {
    borderWidth: 1,
    maxWidth: 75,
    borderColor: '$borderedButtonBlue',
  },
  subscribeButtonText: {
    textAlign: 'center',
    color: '$borderedButtonBlue',
  },
  unsubscribeButton: {
    borderWidth: 1,
    maxWidth: 75,
    borderColor: '$primaryDarkGray',
  },
  unsubscribeButtonText: {
    textAlign: 'center',
    color: '$primaryDarkGray',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinTag: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    width: 30,
  },
});
