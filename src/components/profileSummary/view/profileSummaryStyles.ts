import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  // --- Cover image (edge-to-edge, no margins) ---
  coverContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '$primaryLightBackground',
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  coverImage: {
    width: '100%',
    height: 160,
  },

  // --- Avatar overlapping cover ---
  avatarSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: -40,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '$primaryBackgroundColor',
    backgroundColor: '$primaryBackgroundColor',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },

  // --- Identity section ---
  identitySection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '$primaryDarkText',
  },
  username: {
    fontSize: 14,
    color: '$iconColor',
    marginTop: 1,
  },
  bioText: {
    fontSize: 14,
    color: '$primaryDarkText',
    marginTop: 6,
    lineHeight: 20,
  },

  // --- Metadata row (date, website, location) ---
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 4,
  },
  metadataRowColumn: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 2,
  },

  // --- Follower stats ---
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '$primaryDarkText',
  },
  statLabel: {
    fontSize: 14,
    color: '$iconColor',
    marginLeft: 4,
  },

  // --- VP/RC bars ---
  barsContainer: {
    marginTop: 10,
    paddingHorizontal: 12,
  },

  // --- Action buttons ---
  followActionWrapper: {
    borderColor: '$iconColor',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  editActionWrapper: {
    borderColor: '$iconColor',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  actionText: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 13,
    color: '$primaryDarkText',
  },
  messageButton: {
    borderColor: '$iconColor',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  dropdownStyle: {
    marginLeft: 8,
  },
  dropdownIconStyle: {
    width: 25,
    height: 25,
    color: '$primaryDarkGray',
  },
  activityIndicator: {
    marginLeft: 8,
    width: 30,
  },
});
