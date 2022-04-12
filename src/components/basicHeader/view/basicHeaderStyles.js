import EStyleSheet from 'react-native-extended-stylesheet';
import { NativeModules } from 'react-native';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    // width: '$deviceWidth',
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'center',
  },
  safeArea: {
    backgroundColor: '$primaryBackgroundColor',
    paddingHorizontal: 0,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
    transform: [{ scaleX: NativeModules.I18nManager.isRTL ? -1 : 1 }],
  },
  gearIcon: {
    fontSize: 24,
    color: '$iconColor',
  },
  saveIcon: {
    fontSize: 20,
    color: '$iconColor',
    width: 50,
  },
  savedIcon: {
    color: '#a1c982',
  },
  closeIcon: {
    fontSize: 28,
    color: '$iconColor',
  },
  backWrapper: {
    flexGrow: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickTitle: {
    fontSize: 10,
    color: '$iconColor',
    alignSelf: 'center',
  },
  rightIcon: {
    color: '$iconColor',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  iconButton: {
    marginRight: 24,
    marginLeft: NativeModules.I18nManager.isRTL ? 24 : 0,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  scheduleIcon: {
    color: '$iconColor',
  },
  textButton: {
    fontSize: 16,
  },
  textButtonDisable: {
    color: '$iconColor',
  },
  textButtonEnable: {
    color: '$primaryBlue',
  },
  textButtonWrapper: {
    justifyContent: 'center',
  },
  title: {
    color: '$iconColor',
    // alignSelf: 'center',
    fontSize: 16,
    marginLeft: 16,
    flexGrow: 1,
    fontWeight: '500',
    textAlign: 'left',
  },
  textInput: {
    color: '$iconColor',
    alignSelf: 'center',
    fontSize: 16,
    marginLeft: 16,
    flexGrow: 1,
    fontWeight: '500',
    width: '$deviceWidth / 1.4',
  },
  dateTimeModal: {
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'center',
  },
  beneficiaryModal: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 16,
  },
});
