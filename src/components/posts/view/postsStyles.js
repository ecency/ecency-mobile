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
    marginBottom: 40,
    borderColor: '$borderColor',
  },
  noImage: {
    width: 193,
    height: 189,
  },
  placeholderWrapper: {
    flex: 1,
  },
});
