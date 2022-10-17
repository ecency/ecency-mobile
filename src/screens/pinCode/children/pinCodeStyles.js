import { NativeModules } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '$deviceHeight / 15',
    backgroundColor: '$primaryBackgroundColor',
  },
  logoView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '$deviceWidth / 7',
  },
  backIconContainer: {
    paddingHorizontal: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
    transform: [{ scaleX: NativeModules.I18nManager.isRTL ? -1 : 1 }],
  },
  titleView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#357ce6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  informationText: {
    color: '$editorButtonColor',
    textAlign: 'center',
  },
  informationView: {
    flex: 1,
    alignItems: 'center',
    color: '$primaryBlack',
  },
  animatedView: {
    flex: 1,
    alignItems: 'center',
  },
  numericKeyboardView: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  forgotButtonView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotButtonText: {
    color: '$primaryDarkGray',
    fontSize: 14,
    marginTop: 25,
    alignSelf: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 64 / 2,
  },
});
