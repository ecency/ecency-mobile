import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$modalBackground',
  },
  indicator: {
    backgroundColor: '$iconColor',
  },
  container: {
    height: 400,
  } as ViewStyle,
  content: {
    flex: 1,
    paddingHorizontal: 32,
    marginTop: -40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    backgroundColor: '$modalBackground',
  },
  input: {
    color: '$primaryDarkText',
  },
  resultIcon: {
    marginBottom: 24,
  },
  inputWrapper: {
    borderRadius: 28,
    borderTopEndRadius: 28,
    borderTopStartRadius: 28,
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingRight: 8,
    height: 56,
  } as ViewStyle,
  authInputContent: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  authInputWrapper: {
    width: '90%',
  } as ViewStyle,
  loginBtnWrapper: {
    backgroundColor: '$primaryBackgroundColor',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '$iconColor',
    height: 44,
  } as ViewStyle,
  loginBtnText: {
    color: '$primaryBlack',
  } as TextStyle,
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  activityIndicator: {
    marginRight: 16,
  } as ViewStyle,
  statusText: {
    color: '$primaryDarkText',
    fontWeight: '300',
    fontSize: 24,
    textAlign: 'center',
  } as TextStyle,
});
