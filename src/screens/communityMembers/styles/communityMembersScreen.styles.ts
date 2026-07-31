import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
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
  footerNote: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
    color: '$primaryDarkGray',
    fontSize: 12,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  roleChipText: {
    fontSize: 12,
    color: '$primaryDarkGray',
    textTransform: 'capitalize',
  },
});
