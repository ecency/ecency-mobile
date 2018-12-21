import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '$white',
  },
  tabButton: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontFamily: '$primaryFont',
    marginBottom: 12,
  },
});
