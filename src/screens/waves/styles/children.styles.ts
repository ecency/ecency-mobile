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
    paddingHorizontal: 12,
    gap: 8,
  } as ViewStyle,
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 999,
    backgroundColor: '$primaryLightBackground',
  } as ViewStyle,
  activeTab: {
    borderColor: '$primaryBlue',
    backgroundColor: '$primaryLightBlue',
  } as ViewStyle,
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryDarkText',
    opacity: 0.72,
  } as TextStyle,
  activeTabText: {
    color: '$primaryBlue',
    opacity: 1,
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
