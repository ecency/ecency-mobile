import EStyleSheet from 'react-native-extended-stylesheet';

export const chatsStyles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '$primaryBackgroundColor',
    borderBottomColor: '$primaryLightGray',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '$primaryBlack',
  },
  subtitle: {
    marginTop: 4,
    color: '$primaryDarkText',
    fontSize: 14,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  card: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryBlack',
  },
  cardSubtitle: {
    marginTop: 4,
    color: '$primaryDarkText',
    fontSize: 13,
    lineHeight: 18,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '$borderColor',
    borderBottomWidth: 1,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  channelAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
  },
  channelAvatarText: {
    fontWeight: '700',
    color: '$primaryDarkText',
  },
  channelRowContent: {
    flex: 1,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  channelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '$primaryBlack',
  },
  channelMetaIcon: {
    marginLeft: 6,
  },
  channelMeta: {
    marginTop: 4,
    color: '$primaryDarkText',
    fontSize: 13,
  },
  errorText: {
    color: '$primaryRed',
    marginTop: 8,
  },
  searchContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  searchInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '$primaryBackgroundColor',
    color: '$primaryBlack',
  },
  searchSpinner: {
    marginTop: 8,
  },
  searchResults: {
    marginTop: 10,
  },
  searchSection: {
    marginTop: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '$borderColor',
    borderBottomWidth: 1,
  },
  searchRowContent: {
    flex: 1,
  },
  searchAction: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '$primaryBlue',
  },
  searchActionLabel: {
    color: '$pureWhite',
    fontWeight: '600',
  },
  sectionHeading: {
    fontWeight: '700',
    color: '$primaryDarkText',
    marginBottom: 6,
  },
  channelOptions: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  optionsLabel: {
    fontSize: 18,
    color: '$primaryDarkText',
  },
  unreadBadge: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '$primaryBlue',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  unreadBadgeText: {
    color: '$pureWhite',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    marginTop: 16,
    color: '$primaryDarkText',
  },
});

export const chatThreadStyles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomColor: '$borderColor',
    borderBottomWidth: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  backLabel: {
    color: '$primaryBlue',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
  },
  meta: {
    color: '$primaryDarkText',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
    paddingBottom: 80,
  },
  message: {
    paddingVertical: 10,
    borderBottomColor: '$borderColor',
    borderBottomWidth: 1,
  },
  systemMessage: {
    paddingVertical: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  messageMeta: {
    flex: 1,
  },
  author: {
    fontWeight: '700',
    color: '$primaryBlack',
  },
  body: {
    marginTop: 4,
    color: '$primaryBlack',
    lineHeight: 20,
  },
  systemBody: {
    color: '$primaryDarkText',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  timestamp: {
    marginTop: 4,
    color: '$primaryDarkText',
    fontSize: 12,
  },
  systemTimestamp: {
    color: '$primaryDarkText',
    fontSize: 12,
    marginBottom: 4,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopColor: '$borderColor',
    borderTopWidth: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
    color: '$primaryBlack',
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '$primaryBlue',
  },
  sendLabel: {
    color: '$pureWhite',
    fontWeight: '700',
  },
  emptyState: {
    marginTop: 32,
    textAlign: 'center',
    color: '$primaryDarkText',
  },
});
