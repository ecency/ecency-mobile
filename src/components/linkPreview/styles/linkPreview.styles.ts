import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginVertical: 6,
    flexDirection: 'row',
    padding: 8,
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$iconColor',
    borderRadius: 12,
  } as ViewStyle,
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '$primaryLightBackground',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  hivePost: {
    fontWeight: '300',
    fontSize: 10,
    color: '$primaryBlack',
  },
  title: {
    fontWeight: '500',
    fontSize: 14,
    color: '$primaryBlue',
  },
  body: {
    fontSize: 12,
    color: '$iconColor',
  },
});
