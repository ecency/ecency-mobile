import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  balance: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '$iconColor',
    alignSelf: 'flex-end',
  } as TextStyle,
  marketRate: {
    padding: 10,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryDarkText',
  } as TextStyle,

  mainBtnContainer: {
    alignItems: 'center',
  } as ViewStyle,
  mainBtn: {
    width: '$deviceWidth / 3',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    marginVertical: 16,
  } as ViewStyle,
  buttonText: {
    color: 'white',
  },
});
