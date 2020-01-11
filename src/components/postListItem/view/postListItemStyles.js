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
    // paddingVertical: 10,
    marginVertical: 5,
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
  header: {
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    flex: 1,
    marginTop: 16,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  rightItem: {
    position: 'absolute',
    right: 0,
  },
});
