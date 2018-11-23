import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  tabbar: {
    alignSelf: 'center',
    height: 55,
    backgroundColor: '$primaryBackgroundColor',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  notificationTab: {
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
  leaderboardTab: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
});
