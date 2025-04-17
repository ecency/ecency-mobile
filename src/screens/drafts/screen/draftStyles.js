import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  tabbar: {
    alignSelf: 'center',
    backgroundColor: '$primaryBackgroundColor',
    shadowOpacity: 0.2,
    shadowColor: '$shadowColor',
    shadowOffset: { height: 4 },
    zIndex: 99,
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '100%',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 8,
    justifyContent: 'center',
  },

  deleteButton: {
    height: 44,
    width: 54,
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '$primaryRed',
  },
  tabLabelColor: {
    color: '$primaryDarkText',
  },
});
