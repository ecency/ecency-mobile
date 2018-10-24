import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryLightBlue',
    height: 2,
    marginVertical: 2,
    borderRadius: 50,
  },
  powerBar: {
    backgroundColor: '$primaryBlue',
    height: 2,
    borderRadius: 50,
  },
  percentTitleWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  percentTitle: {
    color: '$primaryBlue',
    fontSize: 11,
    marginVertical: 1,
    height: 15,
  },
});
