import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$modalBackground',
  },
  indicator: {
    backgroundColor: '$iconColor',
  },
  container: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    paddingHorizontal: 32,
    paddingBottom: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryDarkText',
  },
  optionsList: {
    paddingTop: 8,
  },
  optionItem: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryDarkText',
  },
  optionItemDestructive: {
    color: '$primaryRed',
  },
});
