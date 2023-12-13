import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  tabbar: {
    alignSelf: 'center',
    height: 40,
    backgroundColor: '$primaryBackgroundColor',
  },
  tabbarItem: {
    // flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
  mainButtonWrapper: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    flexDirection: 'row',
  },

  cancelButton: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrapper: {
    marginHorizontal: 30,
    marginVertical: 10,
  },
  input: {
    color: '$primaryDarkText',
    flexGrow: 1,
  },
  mainBtnText: {
    flexGrow: 1,
  },
  loginBtnWrapper: {
    marginVertical: 12,
  },
  loginBtnBodyWrapper: {
    flex: 1,
  },
  loginBtnIconStyle: {
    position: 'absolute',
    left: 0,
  },
  hsLoginBtnStyle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '$primaryBlue',
  },
  hsLoginBtnText: {
    flexGrow: 1,
    color: '$primaryBlue',
  },
  hsLoginBtnIconStyle: {
    marginLeft: 20,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '$primaryBackgroundColor',
  },
  noAccountText: {
    color: '$primaryDarkGray',
    fontSize: 16,
  },
  signUpNowText: {
    color: '$primaryBlue',
    marginLeft: 4,
    fontSize: 16,
  },
});
