import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,
  contentContainer: {
    flex: 1,
  } as ViewStyle,
  tabView: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '100%',
  } as ViewStyle,
  tabLabelColor: {
    color: '$primaryDarkText',
  } as TextStyle,
  tabScene: {
    flex: 1,
  } as ViewStyle,
  listSpacing: {
    padding: 32,
  } as ViewStyle,
});
