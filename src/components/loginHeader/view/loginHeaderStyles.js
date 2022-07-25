import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    height: '$deviceHeight / 4',
    backgroundColor: '$primaryBackgroundColor',
  },
  safeArea: {
    backgroundColor: '$primaryBackgroundColor',
  },
  body: {
    flexDirection: 'row',
    maxHeight: '$deviceHeight / 4',
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
    width: 160,
    height: 227,
    marginTop: 40,
    right: -20,
  },
  titleText: {
    alignSelf: 'center',
    marginTop: 20,
    marginLeft: 32,
    width: '$deviceWidth / 4',
  },
  headerRow: {
    width: '$deviceWidth',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '$primaryBackgroundColor',
    paddingVertical: 8,
  },
  logo: {
    width: 32,
    height: 32,
    marginLeft: 32,
    alignSelf: 'center',
  },
  headerButton: {
    margin: 10,
    marginRight: 19,
    alignSelf: 'center',
  },
});
