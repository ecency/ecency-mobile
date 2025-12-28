import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  textWithIconWrapper: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textWithIconWrapperColumn: {
    justifyContent: 'center',
    flexDirection: 'column',
  },
  longImage: {
    borderRadius: 5,
    height: 65,
    marginTop: 16,
    marginBottom: 12,
    alignSelf: 'stretch',
    maxWidth: '100% - 24',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  leftIcons: {
    flex: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insetIconStyle: {
    marginRight: 20,
    color: '$primaryDarkText',
  },
  activityIndicator: {
    marginRight: 20,
    width: 30,
  },
  followCountWrapper: {
    flexDirection: 'column',
    marginRight: 40,
  },
  followCount: {
    fontWeight: 'bold',
    color: '$primaryDarkGray',
    fontSize: 14,
    textAlign: 'center',
  },
  followText: {
    textAlign: 'center',
    color: '$primaryDarkGray',
    fontSize: 9,
  },
  dropdownIconStyle: {
    width: 25,
    height: 25,
    color: '$primaryDarkGray',
  },
  dropdownStyle: {
    marginLeft: 4,
    marginRight: -16,
  },
  actionText: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '$primaryDarkGray',
  },
  followActionWrapper: {
    borderColor: '$primaryDarkGray',
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  messageButton: {
    marginLeft: 8,
    padding: 4,
  },
  editActionWrapper: {
    borderColor: '$primaryDarkGray',
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    paddingHorizontal: 12,
    marginRight: 12,
  },
});
