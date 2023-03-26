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
  mascot: {
    position: 'absolute',
    width: 145,
    height: 210,
    marginTop: 4,
    right: 10,
  },
  titleText: {
    alignSelf: 'center',
    marginTop: 20,
    marginLeft: 32,
    width: '$deviceWidth / 3',
  },
  headerRow: {
    width: '$deviceWidth',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '$primaryBackgroundColor',
    paddingVertical: 8,
  },
  logoContainer: {
    paddingLeft: 32,
    paddingRight: 8,
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
