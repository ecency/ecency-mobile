import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  },
  content: {
    backgroundColor: '$primaryGrayBackground',
  },
  mutedView: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
    alignItems: 'center',
    marginTop: 72,
  },
  cover: {
    width: '$deviceWidth',
    height: 160,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -50,
    borderWidth: 1,
    borderColor: '$white',
    alignSelf: 'center',
  },
  about: {
    borderColor: '$primaryLightGray',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  info: {
    flexDirection: 'row',
    borderBottomWidth: 0,
  },
  tabs: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  tabbar: {
    alignSelf: 'center',
    height: 45,
    backgroundColor: '$primaryBackgroundColor',
    borderBottomColor: '#f1f1f1',
    // marginTop: 8,
  },
  tabView: {
    backgroundColor: '$primaryGrayBackground',
  },
  tabbarItem: {
    flex: 1,
    paddingHorizontal: 7,
    backgroundColor: '#f9f9f9',
    minWidth: '$deviceWidth',
  },
  postTabBar: {
    backgroundColor: '$primaryBackgroundColor',
    flex: 1,
  },
  commentsTabBar: {
    backgroundColor: '$primaryBackgroundColor',
    paddingTop: 5,
  },
  scrollContentContainer: {
    paddingBottom: 60,
  },
  commentsListFooter: {
    padding: 32,
  },
});
