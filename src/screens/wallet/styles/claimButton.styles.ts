import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  engineBtnContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 32,
    marginVertical: 8,
  } as TextStyle,
  engineBtnText: {
    color: '$primaryBlue',
  } as TextStyle,
  engineHeaderContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  claimActivityIndicator: {
    marginLeft: 16,
  } as ViewStyle,
  claimIconWrapper: {
    backgroundColor: '$pureWhite',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 20,
    width: 22,
    height: 22,
  } as ViewStyle,
  claimContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  } as ViewStyle,

  claimBtn: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  } as ViewStyle,

  claimBtnTitle: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  } as TextStyle,
});
