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
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    flex: 1,
    backgroundColor: '$primaryLightBackground',
    paddingHorizontal: 12,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '$primaryLightBackground',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 0,
  },
  sortButtonActive: {
    borderWidth: 2,
    borderColor: '$primaryBlue',
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
    paddingVertical: 8,
    flexGrow: 1,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    width: '100%',
  },
  messageContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageContainerOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    position: 'relative',
  },
  messageBubbleOwn: {
    backgroundColor: '$primaryBlue',
    borderTopRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '$primaryLightBackground',
    borderTopLeftRadius: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  messageActions: {
    marginLeft: 6,
    padding: 2,
  },
  actionsIcon: {
    color: '$pureWhite',
  },
  author: {
    fontWeight: '600',
    fontSize: 13,
    color: '$primaryDarkText',
    marginBottom: 4,
  },
  body: {
    color: '$primaryBlack',
    lineHeight: 20,
    fontSize: 15,
  },
  bodyOwn: {
    color: '$pureWhite',
  },
  bodyOther: {
    color: '$primaryBlack',
  },
  hyperlink: {
    color: '$primaryBlue',
  },
  hyperlinkOwn: {
    color: '$pureWhite',
  },
  hyperlinkOther: {
    color: '$primaryBlue',
  },
  replyPreview: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  replyPreviewWithClose: {
    paddingRight: 4,
  },
  replyPreviewOwn: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  replyPreviewOther: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  replyPreviewLine: {
    width: 3,
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: '$iconColor',
    marginRight: 8,
    alignSelf: 'stretch',
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewAuthor: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyPreviewAuthorOwn: {
    color: '$pureWhite',
    opacity: 0.9,
  },
  replyPreviewAuthorOther: {
    color: '$primaryBlue',
  },
  replyPreviewText: {
    fontSize: 13,
    lineHeight: 16,
  },
  replyPreviewTextOwn: {
    color: '$pureWhite',
    opacity: 0.8,
  },
  replyPreviewTextOther: {
    color: '$primaryDarkText',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -10,
  },
  reactionsContainerOwn: {
    alignSelf: 'flex-end',
    marginRight: 24,
  },
  reactionsContainerOther: {
    alignSelf: 'flex-start',
    marginLeft: 64,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
    borderWidth: 1,
    borderColor: '$primaryBackgroundColor',
    marginHorizontal: 2,
  },
  reactionPillActive: {
    // backgroundColor: '$primaryBlue',
    borderColor: '$primaryBlue',
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '$primaryDarkText',
    marginLeft: 2,
  },
  reactionCountActive: {
    color: '$pureWhite',
  },
  chatImage: {
    width: '100%',
    maxWidth: 250,
    aspectRatio: 1.5,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  chatImageOwn: {
    borderRadius: 12,
  },
  chatImageOther: {
    borderRadius: 12,
  },
  systemMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemMessagePill: {
    paddingHorizontal: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  systemMessage: {
    paddingVertical: 12,
  },
  systemBody: {
    color: '$iconColor',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  no_more_messages: {
    color: '$iconColor',
    alignSelf: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  expandedGroupContainer: {
    marginTop: 8,
  },
  systemUsername: {
    color: '$primaryBlue',
    fontWeight: '600',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  timestampOwn: {
    color: '$pureWhite',
    opacity: 0.9,
  },
  timestampOther: {
    color: '$primaryDarkText',
    opacity: 0.7,
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
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  attachButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: {
    color: '$pureWhite',
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 24,
    marginRight: 8,
    minHeight: 40,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 4,
    minHeight: 40,
  },
  input: {
    flexShrink: 1,
    paddingRight: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '$primaryBlack',
    minHeight: 40,
    maxHeight: 120,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '$primaryBlue',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '$primaryBlue',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '$iconColor',
    shadowColor: '$primaryLightBackground',
    shadowOpacity: 0.1,
  },
  sendLabel: {
    color: '$pureWhite',
    fontWeight: '700',
    fontSize: 14,
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
  composerEditingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    minHeight: 40,
    borderRadius: 8,
    marginTop: 8,
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  editingLabel: {
    color: '$primaryDarkText',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelEditButton: {
    padding: 4,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditLabel: {
    marginLeft: 6,
    color: '$primaryBlue',
    fontWeight: '600',
  },
  cancelEditIcon: {
    color: '$primaryBlue',
  },
  composerReplyPreview: {
    paddingRight: 12,
    paddingTop: 8,
    minHeight: 40,
    borderRadius: 8,
  },
  cancelReplyButton: {
    padding: 4,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    marginTop: 32,
    textAlign: 'center',
    color: '$primaryDarkText',
  },
});
