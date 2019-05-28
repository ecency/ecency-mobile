import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontFamily: '$primaryFont',
  },
});
