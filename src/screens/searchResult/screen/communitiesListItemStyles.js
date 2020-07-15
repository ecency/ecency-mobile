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
    color: '$primaryBlack',
  },
  separator: {
    width: 100,
    alignSelf: 'center',
    backgroundColor: '$primaryDarkGray',
    height: 0.5,
    marginVertical: 5,
  },
  stats: {
    fontSize: 14,
    fontFamily: '$primaryFont',
    color: '$primaryDarkGray',
  },
  subscribeButton: {
    borderWidth: 1,
    borderColor: '$primaryBlue',
  },
  subscribeButtonText: {
    color: '$primaryBlue',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
