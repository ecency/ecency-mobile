import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  userRibbonContainer: {
    borderBottomWidth: EStyleSheet.hairlineWidth,
    borderColor: '$darkGrayBackground',
    marginBottom: 0, // without 0 margin, view will start overlapping UserRibbon
    paddingBottom: 32,
  } as ViewStyle,

  listContainer: {
    paddingTop: 16,
  } as ViewStyle,
});
