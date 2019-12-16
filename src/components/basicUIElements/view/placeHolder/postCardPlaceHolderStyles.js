import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryBackgroundColor',
    padding: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: '$primaryLightBackground',
    marginRight: 0,
    marginLeft: 0,
    marginTop: 0,
  },
  textWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  paragraphWrapper: {
    marginTop: 10,
  },
});
