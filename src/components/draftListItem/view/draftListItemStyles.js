import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    padding: 0,
    marginRight: 0,
    marginLeft: 0,
    marginVertical: 5,
    backgroundColor: '$primaryBackgroundColor',
    shadowOpacity: 0.2,
    shadowColor: '$shadowColor',
    elevation: 0.1,
  },
  body: {
    marginHorizontal: 9,
  },
  thumbnail: {
    width: '$deviceWidth - 16',
    height: 300,
  },
  postDescripton: {
    flexDirection: 'column',
    paddingHorizontal: 8,
    // paddingVertical: 16,
    backgroundColor: '$primaryBackgroundColor',
    marginTop: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 7,
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  summary: {
    fontSize: 13,
    color: '$primaryDarkText',
  },
  header: {
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    flex: 1,
    marginTop: 16,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  rightItem: {
    // position: 'absolute',
    // right: 0,
  },
  iconsContainer: {
    flexDirection: 'row',
  },
});
