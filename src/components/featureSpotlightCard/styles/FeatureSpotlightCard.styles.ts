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
  label: {
    color: '$primaryBlue',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  } as TextStyle,
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
  body: {
    flex: 1,
  } as ViewStyle,
  actionBtn: {
    height: 40,
  } as ViewStyle,
  dismissBtn: {
    marginLeft: 8,
  } as ViewStyle,
});
