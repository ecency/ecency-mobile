import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContainer: {
    backgroundColor: '$primaryBackgroundColor',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '$iconColor',
    textAlign: 'center',
    marginBottom: 12,
  },
  selectAllRow: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '$primaryBlue',
  },
  // Capped so a long operation list cannot push the actions off a short screen.
  list: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 15,
    color: '$primaryBlack',
    marginLeft: 12,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 15,
    color: '$iconColor',
  },
  applyButton: {
    backgroundColor: '$primaryBlue',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginLeft: 8,
  },
  applyButtonDisabled: {
    opacity: 0.4,
  },
  applyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '$white',
  },
});
