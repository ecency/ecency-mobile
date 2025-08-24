import EStyleSheet from 'react-native-extended-stylesheet';
import { isRTL } from '../../../utils/I18nUtils';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '$primaryBackgroundColor',
  },
  headerView: {
    flexDirection: 'row',
    backgroundColor: '$primaryBlue',
    justifyContent: 'center',
    height: 164,
    alignItems: 'center',
  },
  headerContentWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    marginBottom: 20,
    flex: 1,
  },
  contentView: {
    flex: 4,
  },
  userAvatar: {
    marginLeft: isRTL() ? 15 : 20,
    marginRight: isRTL() ? 15 : 0,
  },
  otherUserAvatar: {
    borderWidth: 0.1,
    borderColor: '$borderColor',
    marginLeft: -7,
    marginRight: 10,
  },

  userInfoWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    color: '$pureWhite',
    fontWeight: 'bold',
    fontSize: 14,
  },
  usernick: {
    color: '$pureWhite',
    fontWeight: '500',
    opacity: 0.6,
    marginTop: 2,
  },
  listItem: {
    marginVertical: 15,
  },
  listItemIcon: {
    color: '$iconColor',
    marginRight: 5,
  },
  listItemText: {
    color: '$primaryDarkGray',
    marginLeft: 12,
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
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
    alignItems: 'center',
    marginLeft: 55,
  },
  versionText: {
    textAlign: 'center',
    color: '$iconColor',
  },
  vpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '$pureWhite',
    fontWeight: '500',
    opacity: 0.6,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    padding: 4,
    borderRadius: 16,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 16,
  },
  accountTile: {
    height: 60,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  nameContainer: {
    marginLeft: 8,
  },
  displayName: {
    fontWeight: '600',
    fontSize: 16,
    color: '$primaryBlack',
  },
  name: {
    color: '$primaryDarkGray',
  },
  accountModal: {
    backgroundColor: '$primaryBackgroundColor',
  },
  textButton: {
    color: '$primaryBlue',
  },
  buttonContainer: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  separator: {
    backgroundColor: '$darkIconColor',
    height: 0.5,
  },
  avatarAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    color: '$successColor',
  },
  pwInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
