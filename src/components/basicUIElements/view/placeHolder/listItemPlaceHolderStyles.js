import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryBackgroundColor',
    padding: 20,
    borderColor: '$primaryLightBackground',
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
  },
  paragraphWrapper: {
    marginLeft: 20,
    marginTop: 3,
    flex: 1,
  },
  paragraphWithoutMargin: {
    flex: 1,
  },
});
