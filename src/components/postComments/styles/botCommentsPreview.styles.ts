import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 20,
    alignItems: 'center',
  } as ViewStyle,
  botAvatarsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  } as ViewStyle,
  item: {
    marginLeft: -6,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  labelWrapper: {
    backgroundColor: '$primaryLightBackground',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: -12,
    paddingLeft: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 12,
  } as ViewStyle,
  label: {
    paddingRight: 8,
    fontSize: 16,
    color: '$primaryDarkText',
  },
});
