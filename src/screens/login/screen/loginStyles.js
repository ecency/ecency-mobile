import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  },
  tabbar: {
    alignSelf: 'center',
    height: 40,
    backgroundColor: '$primaryBackgroundColor',
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
    height: '$deviceHeight / 1.95',
  },
  mainButtonWrapper: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    flexDirection: 'row',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 10,
    bottom: 24,
    right: 24,
  },
  cancelButton: {
    marginRight: 10,
  },
  formWrapper: {
    flexGrow: 1,
    marginHorizontal: 30,
    marginVertical: 10,
  },
});
