import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 48,
  },
  notice: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
    color: '$primaryDarkGray',
    fontSize: 13,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '$primaryDarkGray',
    marginBottom: 6,
  },
  formStyle: {
    backgroundColor: '$primaryLightBackground',
    borderRadius: 8,
  },
  input: {
    color: '$primaryBlack',
    paddingHorizontal: 12,
  },
  error: {
    marginTop: 4,
    color: '$primaryRed',
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  saveButton: {
    alignSelf: 'flex-end',
    width: 140,
  },
});
