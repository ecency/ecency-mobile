import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
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
  userInfoView: {
    alignSelf: 'flex-end',
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
    color: '$primaryGray',
    fontSize: 20,
  },
  listItemText: {
    color: '$primaryGray',
    marginLeft: 15,
    fontWeight: '500',
  },
});
