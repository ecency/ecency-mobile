import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  } as ViewStyle,
  subTextWrapper: {
    alignItems: 'center',
    paddingVertical: 24,
  } as ViewStyle,
  welcomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '$primaryBlack',
  },
  subText: {
    fontSize: 16,
    fontWeight: '400',
    color: '$primaryBlack',
    textAlign: 'center',
  } as TextStyle,
  squareButton: {
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
  } as ViewStyle,
  squareButtonInversion: {
    backgroundColor: '$chartBlue',
  } as ViewStyle,
  actionText: {
    alignSelf: 'center',
    color: '$chartText',
  },
  actionTextInversion: {
    color: '$white',
  },
  buttonsWrapper: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  } as ViewStyle,
});
