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
    alignItems: 'center',
  },
  headerContentView: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  contentView: {
    flex: 4,
    paddingTop: 15,
  },
  userAvatar: {
    marginLeft: '$deviceWidth / 10',
  },
  otherUserAvatar: {
    marginLeft: -15,
  },
  userInfoView: {
    alignSelf: 'center',
    marginLeft: 15,
  },
  username: {
    color: '$white',
    fontWeight: 'bold',
    fontSize: 14,
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
    marginLeft: 15,
    fontWeight: '500',
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: '$primaryFont',
    textAlign: 'center',
    margin: 10,
    color: '$white',
    backgroundColor: 'transparent',
  },
  addAccountIconView: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  addAccountIcon: {
    padding: 10,
  },
});
