import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '$primaryBlack',
  },
  summary: {
    fontSize: 13,
    color: '$primaryDarkGray',
  },
  itemWrapper: {
    paddingHorizontal: 9,
    // marginHorizontal: 9,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  itemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  stats: {
    flexDirection: 'row',
  },
  postIcon: {
    alignSelf: 'flex-start',
    fontSize: 20,
    color: '$iconColor',
    margin: 0,
    width: 20,
    marginLeft: 25,
  },
  postIconText: {
    color: '$iconColor',
    fontSize: 13,
    alignSelf: 'center',
  },
  thumbnail: {
    margin: 0,
    alignItems: 'center',
    alignSelf: 'center',
    // height: 200,
    // width: '$deviceWidth - 16',
    borderRadius: 8,
    backgroundColor: '$primaryLightGray',
  },
});
