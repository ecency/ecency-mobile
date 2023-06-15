import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  container: {
    paddingVertical: 8,
    backgroundColor: '$primaryBackgroundColor',
  },
  inputsContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  } as ViewStyle,
  inputLabel: {
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
  revealBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  revealBtnText: {
    color: '$primaryBlue',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  input: {
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '$borderColor',
    paddingHorizontal: 10,
    marginVertical: 8,
    height: 40,
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  } as ViewStyle,
  copyInputContainer: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  copyIconStyle: {
    borderRadius: 0,
    height: 40,
    width: 40,
    backgroundColor: '$primaryBlue',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  } as ViewStyle,
  noKeysContainer: {
    paddingHorizontal: 16,
  } as ViewStyle,
  noKeysText: {
    color: '$primaryBlack',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: '$primaryFont',
  } as TextStyle,
  modalContent: {
    backgroundColor: '$primaryBackgroundColor',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  } as ViewStyle,
  signInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    // borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
  } as ViewStyle,
  signInput: {
    flex: 1,
    height: 40,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: 'white',
    borderColor: '$borderColor',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRightWidth: 0,
    color: 'black',
  } as ViewStyle,
  signBtn: {
    backgroundColor: '$primaryBlue',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  } as ViewStyle,
  signBtnText: {
    fontSize: 14,
    color: 'white',
  } as TextStyle,
  modalDescText: {
    color: '$primaryBlack',
    textAlign: 'left',
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 16,
  } as TextStyle,
  modalHeaderContainerStyle: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  } as ViewStyle,
  modalHeaderTitleStyle: {
    marginLeft: 0,
  } as TextStyle,
  modalCloseBtnStyle: {
    marginRight: 0,
  } as ViewStyle,
});
