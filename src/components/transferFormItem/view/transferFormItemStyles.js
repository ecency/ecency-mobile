import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  leftPart: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  rightPart: {
    flex: 2,
    padding: 10,
  },
});
