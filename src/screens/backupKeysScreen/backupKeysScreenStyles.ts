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
    backgroundColor: '$primaryBlue',
    width: 75,
    height: 40,
    marginLeft: 8,
    borderRadius: 8,
    marginTop: 32,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  revealBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 13,
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
});
