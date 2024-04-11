import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
    borderTopWidth: 1,
    borderColor: '$borderTopColor',
  } as ViewStyle,
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '$borderTopColor',
  } as ViewStyle,
  title: {
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: 'bold',
  } as TextStyle,
  icon: {
    fontSize: 22,
    color: '$primaryDarkText',
    marginLeft: -10,
  },
  content: {
    flexGrow: 1,
    backgroundColor: 'rgb(248 249 250)',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 16,
    marginVertical: 24,
    marginHorizontal: 16,
    padding: 16,
    justifyContent: 'center',
    gap: 16,
  } as ViewStyle,
  contentText: {
    fontSize: 14,
    color: 'rgb(108 117 125)',
  } as TextStyle,
  greyBlock: {} as ViewStyle,
});
