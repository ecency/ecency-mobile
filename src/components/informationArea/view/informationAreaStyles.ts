import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingLeft: 50,
    paddingRight: 32,
    marginTop: 20,
  },
  infoIcon: {
    flex: 0.125,
    fontSize: 20,
    alignSelf: 'center',
  },
  infoText: {
    flex: 0.875,
    fontSize: 12,
    color: '$primaryDarkGray',
  },
  bold: {
    fontWeight: '700',
  },
});
