import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryBackgroundColor',
    borderColor: '$primaryLightBackground',
    marginRight: 0,
    marginLeft: 0,
    flexDirection: 'column',
  },
  paragraphWrapper: {
    marginLeft: 30,
  },
  line: {
    flexDirection: 'row',
    marginVertical: 10,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightBox: {
    marginRight: 20,
  },
});
