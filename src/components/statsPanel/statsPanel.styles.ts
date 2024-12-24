import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  } as ViewStyle,

  statValue: {
    color: '$primaryBlack',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 34,
    fontWeight: 'normal',
    marginBottom: 2,
  } as TextStyle,

  statLabel: {
    color: '$primaryBlack',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'normal',
  } as TextStyle,
});
