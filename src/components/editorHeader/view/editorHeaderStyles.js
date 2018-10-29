import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '$deviceWidth',
    backgroundColor: '$white',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
  },
  backWrapper: {
    flexGrow: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickTitle: {
    flexGrow: 1,
    fontSize: 10,
    color: '$iconColor',
    marginLeft: 24,
    alignSelf: 'center',
  },
  rightIcon: {
    color: '$iconColor',
  },
  iconButton: {
    marginRight: 24,
    justifyContent: 'center',
    alignSelf: 'center',
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
    alignSelf: 'center',
    fontSize: 16,
    marginLeft: 16,
    flexGrow: 1,
    fontWeight: '500',
  },
});
