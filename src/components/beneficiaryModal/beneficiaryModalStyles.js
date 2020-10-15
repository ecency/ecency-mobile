import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  bodyWrapper: { flex: 3, paddingTop: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  weightInput: { flex: 1 },
  weightFormInput: { textAlign: 'center' },
  weightFormInputWrapper: { marginTop: 0 },
  usernameInput: { flex: 4 },
  usernameFormInputWrapper: { marginTop: 0, marginLeft: 10 },
  footerWrapper: { flex: 1 },
  saveButton: {
    width: 100,
    height: 44,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
