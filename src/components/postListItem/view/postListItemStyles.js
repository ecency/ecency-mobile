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
  image: {
    margin: 0,
    alignItems: 'center',
    alignSelf: 'center',
    height: 200,
    width: '$deviceWidth - 16',
    borderRadius: 8,
    backgroundColor: '$primaryLightGray',
  },
  postDescripton: {
    flexDirection: 'column',
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  summary: {
    fontSize: 16,
    color: '$primaryDarkGray',
  },
  header: {
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  rightItem: {
    // position: 'absolute',
    // right: -10,
  },
});
