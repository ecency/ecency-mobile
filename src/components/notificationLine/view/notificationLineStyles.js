import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  notificationWrapper: {
    flex: 1,
    flexDirection: 'row',
    width: '$deviceWidth',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
    backgroundColor: '$primaryBackgroundColor',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    marginLeft: 24,
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 32 / 4,
    marginRight: 24,
  },
  body: {
    flexDirection: 'column',
    flexGrow: 1,
    fontSize: 12,
    marginRight: 28,
    marginLeft: 16,
    alignSelf: 'center',
    width: '$deviceWidth / 1.76',
  },
  titleWrapper: {
    flexDirection: 'row',
  },
  name: {
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  title: {
    color: '$primaryDarkGray',
  },
  moreinfo: {
    color: '$primaryBlack',
    flex: 1,
  },
  description: {
    color: '$primaryBlack',
    fontSize: 12,
    fontWeight: '500',
  },
  isNewNotification: {
    backgroundColor: '$primaryLightBlue',
    borderBottomWidth: 0.5,
    borderBottomColor: '$notificationBorder',
  },
  hasNoAvatar: {
    backgroundColor: '#d8d8d8',
  },
});
