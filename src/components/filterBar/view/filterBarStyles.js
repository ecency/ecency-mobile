import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  filterBarWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightIconWrapper: {
    marginRight: 32,
    alignSelf: 'center',
  },
  rightIcon: {
    color: '$iconColor',
    textAlign: 'center',
  },
});
