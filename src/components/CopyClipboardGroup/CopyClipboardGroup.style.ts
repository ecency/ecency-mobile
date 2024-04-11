import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  wrapper: {
    gap: 8,
    marginBottom: 16,
  },
  container: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  } as ViewStyle,
  title: {
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: 'bold',
  } as TextStyle,
  icon: {
    fontSize: 22,
    color: '$white',
  },
  textWrapper: {
    height: 44,
    width: '100%',
    flexShrink: 1,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '$borderColor',
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    paddingHorizontal: 12,
  } as ViewStyle,
  text: {
    fontSize: 16,
    color: '$chartText',
  } as TextStyle,
  button: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: '$chartBlue',
  } as ViewStyle,
});
