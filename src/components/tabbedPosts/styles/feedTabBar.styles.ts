import EStyleSheet from 'react-native-extended-stylesheet';


export default EStyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
    shadowOpacity: 0.3,
    shadowColor: '$shadowColor',
    elevation: 0.1,
    shadowOffset: {
      height: 1,
    },
    zIndex: 99,
  },

  indicatorStyle: {
    backgroundColor: 'transparent',
  },
  tabStyle: {
    height: 38,
    paddingTop: 0,
  },
  tabBarStyle: {
    flex: 1,
    backgroundColor: EStyleSheet.value("$primaryLightBackground"),  // Background color for the TabBar
  },

  dropdownWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginRight: 8,
    flex: 1,
  },
  filterBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightIconWrapper: {
    paddingRight: 12,
    paddingLeft: 4,
    width: 40,
    alignSelf: 'center',
  },
  rightIcon: {
    color: '$darkIconColor',
    textAlign: 'center',
  },
  rightIconPlaceholder: {
    marginRight: 8,
  },
});
