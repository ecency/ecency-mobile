import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
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
