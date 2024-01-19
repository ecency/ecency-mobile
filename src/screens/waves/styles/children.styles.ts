import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  headerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: '$primaryLightBackground',
  } as ViewStyle,
  headerTitle: {
    color: '$primaryDarkText',
    marginTop: 16,
    fontSize: 24,
    fontWeight: '200',
  } as TextStyle,
});
