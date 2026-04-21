import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },

  // Top row: label + refresh/settings
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontWeight: '300',
    fontSize: 12,
    color: '$iconColor',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topActionButton: {
    padding: 6,
    marginLeft: 4,
  },

  // Balance
  balanceContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '$primaryBlack',
  },
  lastUpdated: {
    fontSize: 11,
    color: '$iconColor',
    fontWeight: '300',
    marginTop: 2,
  },

  // Quick actions row
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '$primaryBlue',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '$primaryBlack',
  },
});
