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
    height: 60,
    marginTop: 16,
    marginBottom: 12,
    alignSelf: 'stretch',
    maxWidth: '$deviceWidth - 24',
    backgroundColor: '#296CC0',
  },
  footer: {
    width: '$deviceWidth - 24',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    height: 30,
  },
  leftIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 20,
  },
  rightIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  // TODO: look at here
  dropdownIconStyle: {
    width: 25,
    height: 25,
    left: -5,
    marginBottom: 3,
    color: '#c1c5c7',
  },
  dropdownStyle: {
    maxWidth: 150,
  },
});
