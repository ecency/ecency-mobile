import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'column',
  },
  primaryDetails: {
    flexDirection: 'row',
  },
  secondaryDetails: {
    flexDirection: 'row',
    marginHorizontal: 3,
  },
  rightContainer: {
    flexDirection: 'column',
    marginLeft: 'auto',
    paddingLeft: 10,
  },
  avatar: {
    borderColor: '$borderColor',
    borderWidth: 1,
    marginRight: 5,
  },
  name: {
    marginHorizontal: 3,
    fontSize: 12,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  reputation: {
    fontSize: 12,
    color: '$primaryDarkGray',
    marginRight: 8,
    alignSelf: 'center',
  },
  date: {
    fontSize: 10,
    color: '$primaryDarkGray',
  },
  avatarNameWrapper: {
    flexDirection: 'row',
  },
  reblogedIcon: {
    color: '$iconColor',
    fontSize: 12,
    marginLeft: 10,
    alignSelf: 'center',
  },
  ownerIndicator: {
    color: '$primaryBlue',
    alignSelf: 'center',
    marginLeft: 8,
  },
});
