import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 24,
  } as ViewStyle,

  statWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  } as ViewStyle,

  statValue: {
    color: '$primaryBlack',
    fontSize: 16,
    fontWeight: 'normal',
  } as TextStyle,

  statLabel: {
    color: '$primaryBlack',
    fontSize: 18,
    fontWeight: 'normal',
  } as TextStyle,
});
