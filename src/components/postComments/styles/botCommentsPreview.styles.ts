import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 16,
    alignItems: 'center',
  } as ViewStyle,
  item: {
    padding: 4,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  labelWrapper: {
    backgroundColor: '$primaryLightBackground',
    padding: 4,
    marginLeft: -8,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: -1,
  },
  label: {
    marginHorizontal: 8,
    color: '$primaryDarkText',
  },
});
