import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  },
  tabbar: {
    alignSelf: 'center',
    height: 55,
    backgroundColor: '$primaryBackgroundColor',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    flex: 1,
  },
  notificationTab: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
  leaderboardTab: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
});
