import EStyleSheet from 'react-native-extended-stylesheet';

export const chatsStyles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'flex-end',
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
  statusPill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    right: 16,
    bottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 12,
    color: '$primaryDarkText',
    fontWeight: '500',
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
    paddingVertical: 14,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 0,
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
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    marginHorizontal: 16,
    backgroundColor: '$primaryWhiteLightBackground',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: '$primaryDarkText',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchResults: {},
  searchSection: {
    marginTop: 10,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  searchRowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  searchRowAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
  },
  searchRowAvatarText: {
    fontWeight: '700',
    color: '$primaryDarkText',
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
  searchMessageAction: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchMessageActionLabel: {
    color: '#357ce6',
    fontWeight: '600',
  },
  searchActionIcon: {
    padding: 8,
  },
  sectionHeading: {
    color: '$primaryDarkText',
    marginBottom: 6,
    fontSize: 20,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backIcon: {
    color: '$primaryBlack',
  },
  headerTextGroup: {
    flex: 1,
    marginLeft: 4,
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
  messageActions: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  actionsIcon: {
    color: '$primaryDarkText',
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
  chatImage: {
    width: '100%',
    aspectRatio: 1.5,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
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
  unreadMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  unreadLine: {
    flex: 1,
    height: 1,
    backgroundColor: '$borderColor',
  },
  unreadLabel: {
    marginHorizontal: 10,
    color: '$primaryBlue',
    fontWeight: '700',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopColor: '$borderColor',
    borderTopWidth: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  attachButton: {
    marginRight: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '$primaryLightBackground',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: {
    color: '$primaryBlue',
  },
  disabledButton: {
    opacity: 0.6,
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
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopColor: '$borderColor',
    borderTopWidth: 1,
    backgroundColor: '$primaryLightBackground',
  },
  editingLabel: {
    color: '$primaryDarkText',
    fontWeight: '600',
  },
  cancelEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelEditLabel: {
    marginLeft: 6,
    color: '$primaryBlue',
    fontWeight: '600',
  },
  cancelEditIcon: {
    color: '$primaryBlue',
  },
  emptyState: {
    marginTop: 32,
    textAlign: 'center',
    color: '$primaryDarkText',
  },
});
