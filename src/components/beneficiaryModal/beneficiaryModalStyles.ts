import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '$modalBackground',
  },
  bodyWrapper: { flex: 1, paddingTop: 20, paddingBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  text: { color: '$primaryBlack', marginBottom: 8 },
  weightInput: { width: 80 },
  weightFormInput: { textAlign: 'center', color: '$primaryBlack' },
  weightFormInputWrapper: { marginTop: 8 },
  usernameInput: { flex: 1, color: '$primaryBlack', marginLeft: 16 },
  usernameFormInputWrapper: { marginTop: 8 },
  footerWrapper: { paddingTop: 16 },
  saveButton: {
    width: 140,
    height: 44,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
});
