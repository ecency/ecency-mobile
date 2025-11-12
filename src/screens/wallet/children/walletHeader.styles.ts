import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    marginBottom: 8,
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  balanceValueContainer: {
    backgroundColor: '$primaryLightBackground',
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    flexShrink: 1,
    maxWidth: '65%',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '$primaryBlack',
    flexShrink: 1,
  },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionIconButton: {
    marginLeft: 0,
  },
  actionIconWrapper: {
    marginLeft: 8,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  firstActionIconWrapper: {
    marginLeft: 0,
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
    color: '$iconColor',
    fontWeight: '300',
    marginLeft: 16,
  },
});
