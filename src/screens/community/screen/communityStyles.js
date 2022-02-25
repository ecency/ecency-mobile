import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  },
  buttonContainer: {
    width: '50%',
    alignItems: 'center',
  },
  tabbar: {
    alignSelf: 'center',
    height: 40,
    backgroundColor: '$primaryBackgroundColor',
    shadowOpacity: 0.2,
    shadowColor: '$shadowColor',
    shadowOffset: { height: 4 },
    zIndex: 99,
    borderBottomColor: '$shadowColor',
    borderBottomWidth: 0.1,
    marginTop: 8,
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
  tabs: {
    flex: 1,
  },
  tabView: {
    backgroundColor: '$primaryGrayBackground',
  },
  description: {
    fontSize: 14,
    fontFamily: '$primaryFont',
    marginTop: 5,
    color: '$primaryBlack',
  },
  descriptionContainer: {
    maxHeight: 250,
  },
  separator: {
    width: 100,
    alignSelf: 'center',
    backgroundColor: '$primaryDarkGray',
    height: 0.5,
    marginVertical: 10,
  },
  stats: {
    fontSize: 14,
    fontFamily: '$primaryFont',
    color: '$primaryDarkGray',
  },
  subscribeButton: {
    borderWidth: 1,
    borderColor: '$primaryBlue',
  },
  collapsibleCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subscribeButtonText: {
    color: '$primaryBlue',
  },
});
