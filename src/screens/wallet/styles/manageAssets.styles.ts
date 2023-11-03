import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginBottom: 12,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '$primaryLightBackground',
  } as ViewStyle,
  engineBtnContainer: {
    alignItems: 'flex-end',
    marginVertical: 8,
  } as TextStyle,
  engineBtnText: {
    color: '$primaryBlue',
  } as TextStyle,
  headerWrapper: {
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  title: {
    fontSize: 16,
    color: '$primaryBlack',
  } as TextStyle,
  rightIconWrapper: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  } as ViewStyle,
  rightIcon: {
    color: '$primaryBlack',
    marginVertical: 12,
    marginHorizontal: 8,
  } as ViewStyle,
});
