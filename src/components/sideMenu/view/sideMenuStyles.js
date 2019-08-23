import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '$primaryBackgroundColor',
  },
  headerView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '$primaryBlue',
    justifyContent: 'center',
    height: 128,
    alignItems: 'center',
  },
  headerContentWrapper: {
    alignItems: 'center',
    height: 70,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  contentView: {
    flex: 4,
  },
  userAvatar: {
    marginLeft: 32,
  },
  otherUserAvatar: {
    borderWidth: 0.1,
    borderColor: '$borderColor',
    marginLeft: -7,
    marginRight: 10,
  },
  userInfoWrapper: {
    alignSelf: 'flex-end',
    marginLeft: 15,
  },
  username: {
    color: '$pureWhite',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
    maxWidth: '$deviceWidth / 3',
  },
  usernick: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  listItem: {
    marginVertical: 15,
  },
  listItemIcon: {
    color: '$iconColor',
    fontSize: 20,
    marginRight: 5,
    width: 25,
  },
  listItemText: {
    color: '$primaryDarkGray',
    marginLeft: 12,
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: '$primaryFont',
    textAlign: 'center',
    margin: 10,
    color: '$white',
    backgroundColor: 'transparent',
  },
  addAccountWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  itemWrapper: {
    flexDirection: 'row',
    marginLeft: 55,
  },
  versionText: {
    textAlign: 'center',
    color: '$iconColor',
  },
});
