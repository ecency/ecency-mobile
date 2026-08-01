import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '$primaryLightBackground',
  },
  avatarColumn: {
    width: 28,
    paddingTop: 2,
  },
  contentColumn: {
    flex: 1,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '$primaryBlack',
    lineHeight: 20,
  },
  link: {
    color: '$primaryBlue',
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: '$primaryDarkGray',
  },
  loading: {
    marginTop: 32,
  },
  emptyText: {
    marginTop: 32,
    textAlign: 'center',
    color: '$primaryDarkGray',
    fontSize: 14,
  },
});
