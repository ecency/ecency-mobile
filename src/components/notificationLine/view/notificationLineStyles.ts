import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  notificationWrapper: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 64,
    paddingVertical: 12,
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
    alignSelf: 'flex-start',
    flexShrink: 1,
  },
  name: {
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  title: {
    color: '$primaryDarkGray',
    flexShrink: 1,
  },
  moreinfo: {
    color: '$primaryBlack',
    flex: 1,
    marginTop: 2,
  },
  description: {
    color: '$primaryBlack',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  timestamp: {
    color: '$iconColor',
    fontSize: 11,
    marginTop: 4,
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
