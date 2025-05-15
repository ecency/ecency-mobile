import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
  },
  communityModal: {
    flex: 1,
    backgroundColor: '$modalBackground',
    margin: 0,
  },
  title: {
    color: '$primaryBlack',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  modalStyle: {
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 8,
  },

  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    justifyContent: 'flex-end',
    zIndex: 999,
  },

  sheetIndicator: {
    backgroundColor: '$primaryWhiteLightBackground',
  },
  label: {
    fontSize: 16,
    color: '$primaryDarkText',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: '$iconColor',
    marginTop: 16,
  },
  inputWrapper: {
    borderRadius: 16,
    borderTopEndRadius: 16,
    borderTopStartRadius: 16,
    marginTop: 12,
    borderBottomColor: 'transparent',
    height: 44,
  },
  input: {
    color: '$primaryDarkText',
    paddingHorizontal: 16,
  },
  picker: {
    height: 50,
    marginBottom: 16,
  },
  actionPanel: {
    marginTop: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  btnMain: {
    paddingHorizontal: 8,
  },
  btnClose: {
    marginRight: 8,
  },
});
