import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    height: '$deviceHeight / 3',
    backgroundColor: '$primaryBackgroundColor',
  },
  safeArea: {
    backgroundColor: '$primaryBackgroundColor',
  },
  body: {
    flexDirection: 'row',
    maxHeight: '$deviceHeight / 3',
    overflow: 'hidden',
    backgroundColor: '$primaryBackgroundColor',
    height: '$deviceHeight / 3.9',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    textAlignVertical: 'center',
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: '400',
  },
  title: {
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '$primaryDarkGray',
    marginBottom: 16,
  },
  mascotContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mascot: {
    width: '60%',
  },
  titleText: {
    alignSelf: 'center',
    marginLeft: 32,
    marginRight: 12,
    flex: 1,
  },
  headerRow: {
    width: '$deviceWidth',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '$primaryBackgroundColor',
    paddingVertical: 8,
  },
  backIconContainer: {
    marginLeft: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
  },
  logoContainer: {
    paddingRight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerButton: {
    margin: 10,
    marginRight: 19,
    alignSelf: 'center',
  },
});
