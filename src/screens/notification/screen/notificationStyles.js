import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  tabbar: {
    alignSelf: 'center',
    height: 55,
    backgroundColor: 'white',
    borderBottomColor: '#f1f1f1',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  notificationTab: {
    backgroundColor: '#fff',
    minWidth: '$deviceWidth',
  },
  leaderboardTab: {
    flex: 1,
    backgroundColor: '#ffffff',
    minWidth: '$deviceWidth',
  },
});
