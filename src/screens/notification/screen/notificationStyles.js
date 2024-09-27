import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  },
  tabView:{
    flex:1
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
  tabbar: {
    backgroundColor: '$primaryBackgroundColor',
  },
  tabbarLabel: {
    color:'$primaryDarkText',
  },
  tabbarIndicator:{
    backgroundColor:'$primaryBlue'
  }
});
