import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'row',
    height: '$deviceHeight - 110',
  },
  userDescription: {
    flexDirection: 'column',
    flexGrow: 1,
    marginLeft: 8,
  },
  voteItemWrapper: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
  },
  voteItemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  name: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    maxWidth: '$deviceWidth - 100',
    fontFamily: '$primaryFont',
  },
  reputation: {
    fontWeight: 'normal',
    fontFamily: '$primaryFont',
  },
  value: {
    color: '$primaryBlue',
    fontSize: 14,
    fontFamily: '$primaryFont',
    fontWeight: 'bold',
  },
  valueGray: {
    color: '$iconColor',
  },
  valueBlack: {
    color: '$primaryBlack',
  },
  rightWrapper: {
    textAlign: 'center',
    alignItems: 'center',
  },
  text: {
    color: '$iconColor',
    fontSize: 12,
    fontFamily: '$primaryFont',
  },
  avatar: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 32 / 2,
  },
  date: {
    color: '$primaryDarkGray',
  },
  itemIndex: {
    color: '$primaryDarkGray',
    fontSize: 10,
    marginRight: 17,
  },
});
