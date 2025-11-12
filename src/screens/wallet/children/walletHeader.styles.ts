import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  totalLabel: {
    fontWeight: '300',
    fontSize: 12,
    color: '$primaryBlack',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
    color: '$primaryBlack',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  actionButton: {
    marginHorizontal: 4,
    marginVertical: 8,
    paddingHorizontal: 24,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
  },
  actionButtonText: {
    fontSize: 13,
    color: '$primaryBlack',
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: '$primaryBlack',
    fontWeight: '300',
  },
});
