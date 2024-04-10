import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  } as ViewStyle,
  title: {
    fontSize: 14,
    alignSelf: 'center',
    color: '$primaryDarkText',
    fontWeight: 'bold',
  } as TextStyle,
  view: {
    flexGrow: 1,
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,
  channelsTopView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '$borderTopColor',
  } as ViewStyle,
  inputView: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '$borderTopColor',
    backgroundColor: '$primaryLightBackground',
  } as ViewStyle,
  input: {
    height: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 24,
    borderColor: '$borderTopColor',
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,
});
