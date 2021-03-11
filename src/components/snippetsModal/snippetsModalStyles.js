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
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
  },
  itemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  username: {},
});
