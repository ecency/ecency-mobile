import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 24,
  } as ViewStyle,

  statWrapper: {
    marginTop: 8,
  } as ViewStyle,

  statValue: {
    color: '$primaryBlack',
    fontSize: 16,
    fontWeight: 'normal',
  } as TextStyle,

  statLabel: {
    color: '$primaryBlack',
    fontSize: 14,
    marginLeft: 8,
    marginVertical: 2,
    fontWeight: 'normal',
  } as TextStyle,
});
