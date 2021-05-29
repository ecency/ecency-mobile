import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor:'$modalBackground',
  },
  bodyWrapper: { flex: 3, paddingTop: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  text: { color: '$primaryBlack', marginBottom: 8 },
  weightInput: { flex: 1 },
  weightFormInput: { textAlign: 'center', color: '$primaryBlack' },
  weightFormInputWrapper: { marginTop: 8, borderRadius:12  },
  usernameInput: { flex: 3, color: '$primaryBlack', marginLeft: 16 },
  usernameFormInputWrapper: { marginTop: 8, marginLeft: 10, borderRadius:12 },
  footerWrapper: { paddingTop:16, paddingBottom:16 },
  saveButton: {
    width: 140,
    height: 44,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
});
