import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  header: {
    marginHorizontal: 16,
  },
  title: {
    fontSize: 24,
    color: '$primaryBlack',
    fontWeight: '900',
    fontFamily: '$primaryFont',
    marginBottom: 11,
  },
  description: {
    flexDirection: 'row',
  },
  scroll: {
    height: '$deviceHeight / 1.135',
  },
  footer: {
    flexDirection: 'column',
    marginTop: 19,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 10,
    fontFamily: '$primaryFont',
    color: '$primaryDarkGray',
    marginVertical: 12,
  },
  footerName: {
    color: '$primaryBlack',
    fontWeight: 'bold',
  },
  stickyWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  barIcons: {
    color: '$primaryDarkGray',
    fontSize: 20,
    marginRight: 8,
    marginLeft: 25,
    alignSelf: 'center',
  },
});
