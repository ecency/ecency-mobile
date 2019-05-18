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
    backgroundColor: '$primaryBackgroundColor',
    marginBottom: 50,
  },
  footer: {
    flexDirection: 'column',
    marginTop: 19,
    marginBottom: 10,
  },
  marginFooter: {
    marginBottom: 50,
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
    width: '$deviceWidth',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  barIcons: {
    color: '$primaryDarkGray',
    fontSize: 20,
    marginRight: 8,
    marginLeft: 25,
    opacity: 0.7,
  },
  barIconRight: {
    color: '$primaryDarkGray',
    fontSize: 16,
    opacity: 0.7,
  },
  barIconButton: {
    marginLeft: 16,
  },
  stickyRightWrapper: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
