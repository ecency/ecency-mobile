import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    borderWidth: 0.5,
    flex: 1,
    borderColor: '$primaryDarkGray',
  },
  leftDivider: {
    marginLeft: 20,
  },
  rightDivider: {
    marginRight: 20,
  },
  orText: {
    fontSize: 16,
    color: '$primaryDarkGray',
    marginHorizontal: 8,
  },
});
