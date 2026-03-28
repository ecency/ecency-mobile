import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  headerContainer: {
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: '$primaryLightBackground',
  } as ViewStyle,
  tabRow: {
    flexDirection: 'row',
  } as ViewStyle,
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  } as ViewStyle,
  activeTab: {
    borderBottomColor: '$primaryBlue',
  } as ViewStyle,
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '$iconColor',
  } as TextStyle,
  activeTabText: {
    color: '$primaryDarkText',
  } as TextStyle,
  tagChipRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  } as ViewStyle,
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  } as ViewStyle,
  tagChipText: {
    color: '$primaryBlue',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  } as TextStyle,
  tagChipClose: {
    color: '$iconColor',
  } as TextStyle,
});
