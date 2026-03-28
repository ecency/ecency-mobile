import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,
  contentContainer: {
    flex: 1,
    paddingTop: 8,
  } as ViewStyle,
  feedsContainer: {
    flex: 1,
  } as ViewStyle,
  tabScenesContainer: {
    flex: 1,
  } as ViewStyle,
  tabScene: {
    flex: 1,
  } as ViewStyle,
  listSpacing: {
    padding: 32,
  } as ViewStyle,
});
