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
