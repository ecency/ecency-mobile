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
    paddingTop: 15,
  },
  userAvatar: {
    marginLeft: '$deviceWidth / 10',
    width: 64,
    height: 64,
    borderRadius: 64 / 2,
  },
  otherUserAvatar: {
    marginLeft: -15,
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    borderWidth: 0.1,
    alignSelf: 'center',
    borderColor: '$borderColor',
  },
  userInfoWrapper: {
    alignSelf: 'flex-end',
    marginLeft: 15,
  },
  username: {
    color: '$white',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  usernick: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  listItem: {
    paddingLeft: '$deviceWidth / 10',
  },
  listItemIcon: {
    color: '$primaryDarkGray',
    fontSize: 20,
  },
  listItemText: {
    color: '$primaryDarkGray',
    marginLeft: 12,
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 14,
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
    marginVertical: 10,
    marginLeft: '$deviceWidth / 20',
  },
});
