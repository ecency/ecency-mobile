import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

// Mirrors src/components/tabbedPosts/styles/feedTabBar.styles.ts so the waves
// tab bar is visually identical to the home feed's (pill active tab over a
// transparent indicator, trailing "+").
export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
  } as ViewStyle,

  tabBarStyle: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
    shadowColor: 'transparent',
  } as ViewStyle,

  indicatorStyle: {
    backgroundColor: 'transparent',
  } as ViewStyle,

  // minWidth is applied inline (layout.width / 3 - 14) to match FeedTabBar.
  tabStyle: {
    width: 'auto',
    paddingHorizontal: 0,
    height: 38,
    paddingTop: 0,
  } as ViewStyle,

  addButtonWrapper: {
    paddingRight: 12,
    paddingLeft: 8,
    width: 44,
    alignSelf: 'center',
  } as ViewStyle,

  addButtonIcon: {
    color: '$darkIconColor',
    textAlign: 'center',
  } as TextStyle,
});
