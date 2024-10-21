import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryLightBackground',
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    flex: 1,
  } as ViewStyle,
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  title: {
    color: '$primaryDarkText',
    fontSize: 18,
    fontWeight: '600',
  } as TextStyle,
  description: {
    color: '$primaryDarkText',
    marginVertical: 8,
  } as TextStyle,
  actionPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  } as ViewStyle,
  voteBtnTitle: {
    // color: '$primaryBlue'
  } as TextStyle,
});
