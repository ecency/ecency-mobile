import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  header: {
    marginHorizontal: 16,
  },
  stickyBar: {
    backgroundColor: '$primaryBackgroundColor',
  },
  headerLine: {
    marginTop: -4,
    marginBottom: 4,
  },
  titlePlaceholder: {
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontFamily: '$primaryFont',
    marginBottom: 11,
  },
  description: {
    flexDirection: 'row',
  },
  scroll: {
    // height: '$deviceHeight',
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  scrollContent: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  footer: {
    flex: 1,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barIcons: {
    color: '$primaryDarkGray',
    fontSize: 20,
    opacity: 0.7,
  },
  barIconButton: {
    marginLeft: 0,
  },
  stickyRightWrapper: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  noPostImage: {
    height: 200,
    width: 300,
  },
});
