import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  primaryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  tagDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'column',
    marginLeft: 'auto',
    marginRight: 10,
    paddingLeft: 10,
  },
  avatar: {
    borderColor: '$borderColor',
    borderWidth: 1,
    marginRight: 5,
  },
  name: {
    marginHorizontal: 3,
    fontSize: 16,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  reputationWrapper: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: '$white',
    borderRadius: 20,
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$primaryDarkGray',
  },
  reputation: {
    fontSize: 10,
    color: '$primaryDarkGray',
    alignSelf: 'center',
    fontWeight: 'bold',
    padding: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '300',
    color: '$primaryDarkGray',
  },
  topic: {
    marginVertical: 3,
    marginRight: 0,
    paddingRight: 0,
    marginLeft: 0,
    paddingLeft: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
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
  pushPinIcon: {
    color: '$primaryRed',
    alignSelf: 'center',
    marginLeft: 8,
  },
  rightIcon: {
    color: '$iconColor',
  },
  rightButton: {
    marginRight: 10,
  },
});
