import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
    shadowOpacity: 0.2,
    shadowColor: '$shadowColor',
    elevation: 0.1,
    marginBottom: 5,
    paddingTop: 5,
  },
  filterBarWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightIconWrapper: {
    marginRight: 16,
    alignSelf: 'center',
  },
  rightIcon: {
    color: '$darkIconColor',
    textAlign: 'center',
  },
});
