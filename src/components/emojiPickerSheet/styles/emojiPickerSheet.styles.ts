import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    height: '90%',
    backgroundColor: '$primaryBackgroundColor',
  },
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '$primaryLightBackground',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '$primaryDarkText',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '$primaryDarkGray',
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
    color: '$primaryDarkText',
    fontSize: 14,
  },
  emojiList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  emojiButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  emojiCharacter: {
    fontSize: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '$primaryDarkGray',
    paddingVertical: 32,
  },
});
