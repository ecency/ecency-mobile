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
  reactionsSection: {
    marginBottom: 8,
  },
  reactionsList: {
    paddingHorizontal: 16,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '$primaryLightBackground',
    minWidth: 50,
  },
  reactionButtonActive: {
    backgroundColor: '$primaryBlue',
  },
  reactionEmoji: {
    fontSize: 20,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '$primaryDarkText',
  },
  optionsSection: {
    paddingTop: 8,
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
