import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '$primaryGray',
    fontSize: 18,
    marginRight: 8,
  },
  rightTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  text: {
    fontFamily: '$primaryFont',
    color: '$primaryBlack',
    fontSize: 16,
  },
  rightText: {
    fontFamily: '$primaryFont',
    color: '$primaryBlue',
    fontSize: 14,
    fontWeight: '600',
  },
  thinText: {
    fontSize: 14,
    fontWeight: '100',
    color: '$primaryGray',
  },
  onlyRightText: {
    color: '$primaryGray',
  },
});
