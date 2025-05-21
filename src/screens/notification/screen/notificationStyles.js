import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  },
  tabView: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '100%',
  },
  tabLabelColor: {
    color: '$primaryDarkText',
  },
});
