import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '$primaryLightBackground',
    borderLeftWidth: 3,
    borderLeftColor: '$primaryRed',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  body: {
    fontSize: 12,
    color: '$primaryDarkGray',
    marginTop: 2,
  },
  action: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '$primaryBlue',
  },
});
