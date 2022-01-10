import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },

  modalContainer: {
    padding: 12,
  },
  modalHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    color: '$iconColor',
    fontSize: 16,
    flexGrow: 1,
    fontWeight: '500',
    height: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  commentBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
});
