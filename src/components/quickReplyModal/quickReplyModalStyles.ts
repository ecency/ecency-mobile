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

  intialView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  addCommentBtn: {
    backgroundColor: '$primaryLightBackground',
    flex: 1,
    height: 50,
    marginLeft: 8,
    borderRadius: 8,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  modalHeader: {},
  titleBtnTxt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  inputContainer: {
    paddingVertical: 16,
  },
  textInput: {
    color: '$iconColor',
    fontSize: 16,
    flexGrow: 1,
    fontWeight: '500',
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  commentBtn: {
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
