import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
  },
  list: {
    paddingHorizontal: 12,
  },
  card: {
    width: 200,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '$primaryLightBackground',
    borderWidth: 0.5,
    borderColor: '$primaryDarkGray',
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '$primaryDarkGray',
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryGray',
  },
  body: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    fontWeight: '600',
    minHeight: 36,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  author: {
    fontSize: 11,
    color: '$primaryDarkText',
    fontFamily: '$primaryFont',
    flex: 1,
  },
  date: {
    fontSize: 11,
    color: '$iconColor',
    fontFamily: '$primaryFont',
    marginLeft: 8,
  },
});
