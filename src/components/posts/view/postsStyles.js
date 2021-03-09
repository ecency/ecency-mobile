import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryLightBackground',
  },
  placeholder: {
    backgroundColor: '$primaryBackgroundColor',
    padding: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 5,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
  },
  tabs: {
    position: 'absolute',
    top: '$deviceWidth / 30',
    alignItems: 'center',
  },
  flatlistFooter: {
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 60,
    borderColor: '$borderColor',
  },
  noImage: {
    width: 193,
    height: 189,
  },
  placeholderWrapper: {
    flex: 1,
  },
  noPostTitle: {
    textAlign: 'center',
    marginVertical: 16,
    color: '$primaryBlack',
  },
  popupContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  popupContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryBlue',
    paddingHorizontal: 0,
    paddingVertical: 2,
    borderRadius: 32,
  },
  popupText: {
    fontWeight: '500',
    color: '$white',
    marginLeft: 6,
  },
  closeIcon: {
    color: '$white',
    margin: 0,
    padding: 6,
  },
  arrowUpIcon: {
    color: '$white',
    margin: 0,
    marginHorizontal: 4,
  },
  popupImage: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: -8,
    borderColor: '$primaryBlue',
  },
});
