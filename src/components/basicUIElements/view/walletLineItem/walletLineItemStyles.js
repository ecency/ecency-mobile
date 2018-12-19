import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  fitContent: {
    marginVertical: 0,
  },
  iconTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '$primaryDarkGray',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 1,
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
    marginLeft: 8,
  },
  longText: {
    maxWidth: '$deviceWidth / 2.5',
  },
  description: {
    fontSize: 12,
    marginLeft: 8,
    fontFamily: '$primaryFont',
    color: '$iconColor',
  },
  onlyText: {
    marginLeft: 40,
  },
  rightText: {
    fontFamily: '$primaryFont',
    color: '$primaryBlue',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '$deviceWidth / 2.5',
    textAlign: 'center',
  },
  thinText: {
    fontSize: 14,
    fontWeight: '100',
    color: '$primaryDarkGray',
  },
  onlyRightText: {
    color: '$primaryDarkGray',
  },
  circleIcon: {
    backgroundColor: '$primaryGray',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
