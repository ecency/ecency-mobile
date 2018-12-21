import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
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
    color: '$primaryDarkText',
    textAlign: 'center',
  },
});
