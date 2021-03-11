import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  bodyWrapper: {
    flex: 3,
    paddingTop: 20,
  },
  itemWrapper: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '$primaryBackgroundColor',
  },
  itemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  title: {
    fontWeight: '600',
    paddingBottom: 10,
  },
  body: {},
});
