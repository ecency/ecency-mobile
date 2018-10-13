import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '$deviceWidth',
    backgroundColor: '$white',
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
  },
  backIconButton: {
    flexGrow: 1,
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
    color: '$iconColor',
    fontSize: 16,
  },
  textButtonWrapper: {
    justifyContent: 'center',
  },
});
